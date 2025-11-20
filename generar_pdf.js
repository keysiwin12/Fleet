function prepararDatosVisuales(metricasCliente) {
  return {
    // --- gauges principales ---
    conectividad: {
      valor: metricasCliente.porcentajes.conectadas,
      total: metricasCliente.totales.totalEquipos,
      conectados: metricasCliente.totales.conectados15d
    },
    mantenimiento: {
      valor: metricasCliente.porcentajes.mantenimiento,
      equipos: metricasCliente.totales.mantProxLt50h
    },
    excesoRalenti: {
      valor: metricasCliente.porcentajes.excesoRalenti,
      equipos: metricasCliente.totales.equiposExcesoRalenti
    },
    ralentiFlota: {
      valor: metricasCliente.porcentajes.ralentiFlota,
      horasMotor: metricasCliente.totales.horasMotor,
      horasRalenti: metricasCliente.totales.horasRalenti
    },

    // --- gráficos secundarios ---
    impacto: {
      combustible: metricasCliente.totales.combPerdidoGal,
      horas: metricasCliente.totales.horasRalenti,
      perdidaUSD: metricasCliente.economico.perdidaUSD_por_combustible
    },
    dtc: metricasCliente.dtc,
    expertAlerts: metricasCliente.expertAlerts,
    aceite: metricasCliente.aceite,
    lineas: metricasCliente.distribucionLineas
  };
}

function generarGraficosMetricasCliente(metricas) {
  if (!metricas || !metricas.totales) {
    return `<div style="color:red;">❌ Sin métricas disponibles</div>`;
  }

  const { totales, dtc, expertAlerts ,aceite,distribucionLineas} = metricas;

  return `
  <div style="
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    background: #f9fafc;
    padding: 15px;
    border-radius: 10px;
    page-break-inside: avoid;
  ">

    <!-- 🔹 Fila 1: Conectividad, mantenimiento, ralentí -->
    ${graficoLineasEquipos(distribucionLineas.lineaAF,distribucionLineas.lineaCF,distribucionLineas.lineaW,distribucionLineas.lineaOtros)}
    ${generarGraficoConectividadTotal(totales.conectados15d, totales.totalEquipos)}
    ${generarGraficoMantenimiento(totales.mantProxLt50h, totales.conectados15d)}
    ${generarGraficoRalenti(totales.equiposExcesoRalenti, totales.conectados15d)}
    ${generarGraficoPercentRalenti(totales.horasMotor, totales.horasRalenti)}

    <!-- 🔹 Fila 2: Alertas -->
    ${graficoDTC(dtc.alta, dtc.media, dtc.info)}
    ${graficoExpertAlerts(expertAlerts.critica, expertAlerts.alta)}
    ${graficoAceite(aceite.normal, aceite.precaucion, aceite.anormal)}

    <!-- 🔹 Fila 3: Impacto económico -->
    ${graficoImpactoEconomico(
      totales.combPerdidoGal,
      totales.horasRalenti,
      totales.impactoEstimadoUSD
    )}
  </div>
  `;
}


/**
 * 📦 Genera PDFs (4 páginas) para TODOS los clientes del modelo
 * - Crea carpeta en Drive con fecha
 * - Maneja errores por cliente sin detener el lote
 * - Reutiliza el mismo render que ya tienes
 * @param {Object} [opts]
 * @param {string[]} [opts.onlyIds]   // opcional: procesar solo estos OpCenter IDs
 * @param {number}   [opts.max]       // opcional: tope de clientes a procesar (para pruebas)
 * @param {string}   [opts.folderId]  // opcional: carpeta destino en Drive
 * @returns {Object} resumen
 */
function probarPDF4PaginasTodos(opts = {}) {
  const t0 = new Date();
  const log = (...a) => Logger.log(a.join(" "));
  log("🧪 Lote PDF 4 páginas (Todos los clientes) — inicio");

  // =========================
  // 0) Modelo + carpeta Drive
  // =========================
  const modelo = generarModeloConMetricas();
  const mapaClientes = (modelo.relaciones && modelo.relaciones.clientes_por_opcenter) || {};
  const allIds = Object.keys(mapaClientes);

  // Filtro opcional
  let targetIds = Array.isArray(opts.onlyIds) && opts.onlyIds.length
    ? allIds.filter(id => opts.onlyIds.includes(id))
    : allIds;

  if (typeof opts.max === "number" && opts.max > 0) {
    targetIds = targetIds.slice(0, opts.max);
  }

  if (!targetIds.length) {
    throw new Error("No hay clientes para procesar (clientes_por_opcenter vacío o filtros vaciaron la lista).");
  }

  // Carpetas destino (clasificadas por tipo de cliente)
  const carpetas = prepararCarpetasSemana(
    modelo.periodo.fecha_inicio,
    modelo.periodo.fecha_fin
  );
  log("📂 Carpetas creadas:");
  log("  - Clientes:", carpetas.clientes.getName());
  log("  - CBD:", carpetas.cbd.getName());
  log("  - Signature:", carpetas.signature.getName());

  // =========================
  // 1) Pre-cargar assets/ayudas
  // =========================
  const logosB64 = cargarLogosBase64();
  const toDataUrl = (b64, mime = 'image/png') => b64 ? (b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`) : '';

  // =========================
  // 2) Iterar clientes
  // =========================
  const resultados = [];
  let ok = 0, fail = 0, totalBytes = 0;

  targetIds.forEach(clienteId => {
    const cliente = mapaClientes[clienteId];
    if (!cliente) {
      resultados.push({ clienteId, ok: false, error: "Cliente no encontrado en el modelo." });
      fail++;
      return;
    }

    try {
      const r = _generarPdf4PaginasParaCliente({
        cliente,
        modelo,
        logosB64,
        toDataUrl,
        carpetas,
      });

      resultados.push({ clienteId, ok: true, url: r.url, nombre: r.nombre, size: r.tamaño });
      ok++;
      totalBytes += r.tamaño || 0;
      log(`✅ ${cliente.razon_social || cliente.nombre || clienteId}: ${r.url}`);
    } catch (e) {
      resultados.push({ clienteId, ok: false, error: e && e.message ? e.message : String(e) });
      fail++;
      log(`❌ ${cliente.razon_social || cliente.nombre || clienteId}:`, e.message);
    }
  });

  const dt = ((new Date()) - t0) / 1000;
  const resumen = {
    clientesProcesados: targetIds.length,
    ok,
    fail,
    bytesTotales: totalBytes,
    tamañoTotalKB: (totalBytes / 1024).toFixed(2),
    carpetas: {
      clientes: { name: carpetas.clientes.getName(), url: carpetas.clientes.getUrl() },
      cbd: { name: carpetas.cbd.getName(), url: carpetas.cbd.getUrl() },
      signature: { name: carpetas.signature.getName(), url: carpetas.signature.getUrl() }
    },
    duracionSeg: dt,
    resultados
  };

  // Alerta final (una sola)
  try {
    SpreadsheetApp.getUi().alert(
      '✅ Lote PDF 4 Páginas — Completado',
      `Periodo: ${carpetas.periodo.inicio} — ${carpetas.periodo.fin}\n` +
      `Total clientes: ${targetIds.length}\n` +
      `OK: ${ok} | Fallidos: ${fail}\n` +
      `Peso total: ${(totalBytes/1024).toFixed(2)} KB\n` +
      `Duración: ${dt.toFixed(1)} s\n\n` +
      `PDFs clasificados en carpetas:\n` +
      `• Clientes • CBD • Signature`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (_) {}

  log("🏁 Lote completado. OK:", ok, "FAIL:", fail, "Tiempo (s):", dt.toFixed(1));
  return resumen;
}

/**
 * ♻️ Genera 1 PDF (4 páginas) para un cliente dado
 * - Es la misma lógica de tu función original, pero sin UI por cliente
 * - Devuelve blob info + fileUrl
 * @param {Object} ctx
 * @param {Object} ctx.cliente
 * @param {Object} ctx.modelo
 * @param {Object} ctx.logosB64
 * @param {Function} ctx.toDataUrl
 * @param {Object} ctx.carpetas - Objeto con carpetas {clientes, cbd, signature}
 * @returns {{url:string, nombre:string, tamaño:number, carpeta:string}}
 */
function _generarPdf4PaginasParaCliente({ cliente, modelo, logosB64, toDataUrl, carpetas }) {
  // 🔹 Portada (2 páginas)
  const { html: portadaHTML } = renderPortada2Paginas({
    cliente: {
      razon_social: cliente.razon_social || cliente.nombre || 'Cliente',
      ruc: cliente.ruc || cliente.nif || '',
      segmento: cliente.segmento || cliente.tipo || ''
    },
    periodo: modelo.periodo,  // ✅ Desde CONFIG
    images: {
      fleetAssurance: toDataUrl(logosB64.fleetAssurance, 'image/png'),
      imagenInstitucional: toDataUrl(logosB64.imagenInstitucional, 'image/png'),
      logoCSC: toDataUrl(logosB64.logoCSC, 'image/png'),
      logoIpesa: toDataUrl(logosB64.logoIpesa, 'image/png')
    },
    meta: {
      titulo: 'Reporte de Gestión de Flota - Nº Informe: ' + " " + cliente.num_informe,
      subtitulo: 'Centro de Soluciones Conectadas — IPESA'
    }
  });

  // 🔹 Datos secciones
  const dataResumen = renderGraficosResumen(cliente.metricas || {});
  const recomendacionesHTML = buildRecomendaciones(cliente.metricas || {});
  const dataConectividad = renderGraficosConectividad(cliente.equipos || [], modelo.periodo);
  const dataUtilizacion = renderUtilizacion(cliente.equipos || [], cliente.metricas || {}, modelo.periodo, modelo.config.precio_galon);  // ✅ Desde CONFIG

  // 🔹 DTC
  const equiposDTC = (cliente.equipos || []).map(eq => ({
    id_equipo: eq.id_equipo || eq.pin || eq.num_serie || eq.numero_serie,
    pin: eq.pin || eq.num_serie || eq.numero_serie,
    modelo: eq.modelo,
    familia: eq.familia,
    num_interno: eq.num_interno,
    dtc: Array.isArray(eq.dtc) ? eq.dtc : []
  }));
  const { html: dtcHTML } = renderDTC({
    equipos: equiposDTC,
    periodo: {
      ini: modelo.periodo.fecha_inicio,
      fin: modelo.periodo.fecha_fin,
      label: modelo.periodo.label
    },  // ✅ Desde CONFIG
    opciones: { ordenar: 'criticos' }
  });

  // 🔹 Fluidos
  const periodoFluidos = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG
  const htmlFluidos = generarAnalisisFluidosRenderizado(
    cliente.equipos || [],
    periodoFluidos,
    logosB64
  );

  // 🔹 Expert Alerts
  const expertAlertsHTML = generarEventosAlerta(
    cliente.equipos || [],
    {
      inicio: modelo.periodo.inicio,
      fin: modelo.periodo.fin
    }  // ✅ Desde CONFIG
  );

  // 🔹 Acciones/Recomendaciones extendidas
  const accionesHTML = generarAccionesRecomendaciones(
    cliente.equipos || [],
    {
      inicio: modelo.periodo.inicio,
      fin: modelo.periodo.fin
    }  // ✅ Desde CONFIG
  );

  // 🔹 Contactos
  const contactosHTML = generarSeccionContactos(
    cliente,
    {
      inicio: modelo.periodo.inicio,
      fin: modelo.periodo.fin
    }  // ✅ Desde CONFIG
  );

  // 🔹 John Deere Protect
  const jdProtectHTML = generarPaginaJohnDeereProtect(logosB64.imagenPromoJDProtect);

  // 🔹 Template
  const htmlTemplate = HtmlService.createTemplateFromFile('reporte-flota');
  htmlTemplate.portadaHTML = portadaHTML;
  htmlTemplate.htmlFluidos = htmlFluidos;
  htmlTemplate.expertAlertsHTML = expertAlertsHTML;
  htmlTemplate.metricas = cliente.metricas || {};
  htmlTemplate.data = dataResumen;
  htmlTemplate.accionesHTML = accionesHTML;
  htmlTemplate.recomendacionesHTML = recomendacionesHTML;
  htmlTemplate.dataConectividad = dataConectividad;
  htmlTemplate.dataUtilizacion = dataUtilizacion;
  htmlTemplate.dtcHTML = dtcHTML;
  htmlTemplate.contactosHTML = contactosHTML;
  htmlTemplate.jdProtectHTML = jdProtectHTML;  // 🛡️ John Deere Protect
  htmlTemplate.cliente = cliente;
  htmlTemplate.periodo = modelo.periodo;  // ✅ Desde CONFIG

  // 🔹 Render → PDF → Drive
  const htmlOutput = htmlTemplate.evaluate();
  const pdfBlob = htmlOutput.getAs(MimeType.PDF);

  const tz = Session.getScriptTimeZone() || "America/Lima";
  const marca = Utilities.formatDate(new Date(), tz, "yyyyMMdd_HHmmss");
  const nombreArchivo = `Reporte_de_Flota_${(cliente.razon_social || cliente.nombre || "Cliente").replace(/[^\w\- ]+/g,'').slice(0,60)}_${marca}.pdf`;

  pdfBlob.setName(nombreArchivo);

  // Guardar en carpeta correspondiente según tipo de cliente (CBD, Signature, Clientes)
  const resultado = guardarPDFEnDrive(pdfBlob, cliente, carpetas);
  const pdfFileId = resultado.fileId;

  enviarCorreoCliente(cliente, pdfFileId);

  return {
    url: resultado.url,
    nombre: resultado.nombre,
    tamaño: DriveApp.getFileById(pdfFileId).getSize(),
    carpeta: resultado.carpeta  // "CBD", "Signature" o "Estándar"
  };
}


function registrarEnvioLog(clienteData,numInforme) {
  try {
    
    const hojaSeguimiento = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG_ENVIOS");
    // Obtener fecha y hora actual
    const fechaHoraCompleta = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm:ss");
    
    // Preparar datos para insertar
    const nuevosDatos = [
      numInforme,                    // num_informe
      clienteData.id_op_center,      // cliente (id_op_center)
      fechaHoraCompleta,             // fecha_envio
      "",                            // sugerencias (vacío)
      "",                            // id_cliente (vacío)
      "",                            // razón_social (vacío)
      clienteData.metricas.distribucionLineas.lineaCF, //número de flota cf
      clienteData.metricas.distribucionLineas.lineaAF, //número de flota ag
      clienteData.metricas.distribucionLineas.lineaW, //número de flota wg
      clienteData.metricas.distribucionLineas.lineaOtros, //número de flota al
    ];
    
    // Insertar en la siguiente fila disponible
    const ultimaFila = hojaSeguimiento.getLastRow() + 1;
    hojaSeguimiento.getRange(ultimaFila, 1, 1, 10).setValues([nuevosDatos]);
    
    console.log(`Registro guardado en LOG: ${numInforme} - ${clienteData.razon_social}`);
    
  } catch (error) {
    console.error(`Error al registrar en LOG para ${clienteData.razon_social}:`, error);
    throw error;
  }
}

function generarHTMLCorreo(razon, ruc, numInforme) {

  const fechaInicio = Utilities.formatDate(new Date(config.fecha_inicio), Session.getScriptTimeZone(), "dd/MM/yyyy");
  const fechaFin = Utilities.formatDate(new Date(config.fecha_fin), Session.getScriptTimeZone(), "dd/MM/yyyy");
  const periodo = fechaInicio + " al " + fechaFin;
  
  // URL pre-llenada con el número de informe
  const formsUrl = `https://docs.google.com/forms/d/e/1FAIpQLSc8O8ZWsYL5FbKvLbvm1K8gGmtsM8n4Nby8pd3jGFIn5zmrtQ/viewform?usp=pp_url&entry.836904769=${encodeURIComponent(numInforme)}`;
  
  return `
  <div style="font-size: 15px; color: #333; line-height: 1.6; text-align: justify; max-width: 700px; margin: 0 auto; font-family: Arial, sans-serif;">

    <p style="text-align: center;">
      <img src="cid:cabecera" alt="IPESA - Centro de Soluciones Conectadas" width="100%" style="width: 100%; max-width: 100%;">
    </p>
    
    <p>Estimado(a) representante de <strong>${razon}</strong> (${ruc}),</p>

    <p>Desde el Centro de Soluciones Conectadas de IPESA, compartimos con usted el reporte de Gestión de Flota del periodo ${periodo}.</p>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #0047AB; margin: 25px 0;">
      <p style="margin: 0 0 15px 0; font-weight: bold; color: #0047AB; font-size: 16px;">
        Encuesta de Satisfacción
      </p>
      <p style="text-align: center; margin: 20px 0;">
        <a href="${formsUrl}" 
           style="background: #0047AB; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
          Completar Encuesta Aquí
        </a>
      </p>
    </div>

    <p>Ante cualquier consulta adicional, quedamos a su disposición.</p>

    <p>Atentamente,</p>

    <p><strong>IPESA - Centro de Soluciones Conectadas</strong><br>
    <a href="mailto:SolucionesIntegradas@ipesa.com.pe" style="color: #0047AB; text-decoration: none;">SolucionesIntegradas@ipesa.com.pe</a> | 957 696 797</p>

    <p style="text-align: center; margin-top: 30px;">
      <img src="cid:pie" alt="Centro de Soluciones Conectadas" width="350" style="max-width: 100%;">
    </p>

  </div>
  `;
}

function enviarCorreoCliente(clienteData, pdfFileId) {

  //info cliente
  try {
    //fecha
    const fechahoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
    //imágenes correo
    const imgArriba = DriveApp.getFileById(config.img_cabecera_correo).getBlob();
    const imgAbajo = DriveApp.getFileById(config.img_pie_correo).getBlob();
    //numinforme
    //hoja para logs
    const hojaSeguimiento = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG_ENVIOS");
    
    // Verificar que la hoja existe
    if (!hojaSeguimiento) {
      console.error("No se encontró la hoja LOG_ENVIOS");
      return;
    }
    
    // Generar número de informe
    const numInforme = numinforme(clienteData.id_op_center, hojaSeguimiento);
    
    // Obtener destinatarios (contactos del cliente)
    const destinatarios = clienteData.contactos
      .filter(contacto => contacto.correo && contacto.correo.trim() !== '')
      .map(contacto => contacto.correo)
      .join(',');
    
    if (!destinatarios) {
      console.log(`No hay contactos con correo para el cliente: ${clienteData.razon_social}`);
      return;
    }
    
    // Obtener correos de asesores para copia
    const correosAsesores = Object.values(clienteData.asesores || {})
      .filter(asesor => asesor.email && asesor.email.trim() !== '')
      .map(asesor => asesor.email);
    
    // Configurar opciones del correo
    const opcionesCorreo = {
      name: 'IPESA - Centro de Soluciones Conectadas',
      htmlBody: generarHTMLCorreo(clienteData.razon_social,clienteData.nif,numInforme),
      attachments: [DriveApp.getFileById(pdfFileId).getAs(MimeType.PDF)],
      inlineImages: {
        cabecera: imgArriba,
        pie: imgAbajo
      }
    };
    
    // Agregar CC si hay asesores
    if (correosAsesores.length > 0) {
      opcionesCorreo.cc = correosAsesores.join(',')+ ',cgomezs@ipesa.com.pe';
    }

    if (clienteData.es_cbd === true){
      opcionesCorreo.cc = opcionesCorreo.cc ? opcionesCorreo.cc + ",solucionesintegradas@ipesa.com.pe" : "solucionesintegradas@ipesa.com.pe";
      opcionesCorreo.bcc = "reportcbd@expertconnect.johndeere.com";
    }
    
    // Enviar el correo
    GmailApp.sendEmail(
      destinatarios,
      // "ksimbron@ipesa.com.pe",
      `Reporte de Gestión de Flota | ${fechahoy} | ${clienteData.razon_social}`,
      '',
      opcionesCorreo
    );
    
    console.log(`Correo enviado exitosamente a: ${clienteData.razon_social}`);

    registrarEnvioLog(clienteData,numInforme);
    
  } catch (error) {
    console.error(`Error al enviar correo para ${clienteData.razon_social}:`, error);
    throw error;
  }
}





