/**
 * 🆕 PRUEBA: PDF con 4 páginas (Resumen + Recomendaciones + Conectividad + Utilización)
 * Proof of Concept extendido para validar patrón con sección de Utilización
 */
function probarPDF4PaginasConHtmlService(clienteId = "74991") {
  try {
    Logger.log("🧪 Iniciando prueba con 4 páginas: Resumen + Recomendaciones + Conectividad + Utilización");
    Logger.log("📋 Usando HtmlService.createTemplateFromFile() + getAs(MimeType.PDF)");

    // 1. Construir modelo con métricas
    const modelo = generarModeloConMetricas();

    // 2. Seleccionar cliente específico
    const cliente = modelo.relaciones.clientes_por_opcenter[clienteId];
    if (!cliente) {
      throw new Error(`❌ Cliente con ID ${clienteId} no encontrado. Verifica el ID del OpCenter.`);
    }

    
    // Cargar logos en base64 crudo
    const L = cargarLogosBase64();

    // Helper: convertir a data-URL
    const toDataUrl = (b64, mime='image/png') => b64 ? (b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`) : '';

    // Renderizar portada de 2 páginas
    const { html: portadaHTML } = renderPortada2Paginas({
      cliente: {
        razon_social: cliente.razon_social || cliente.nombre || 'Cliente',
        ruc: cliente.ruc || cliente.nif || '',
        segmento: cliente.segmento || cliente.tipo || ''
      },
      periodo: modelo.periodo || { ini: config.fecha_inicio, fin:  config.fecha_fin },
      images: {
        fleetAssurance: toDataUrl(L.fleetAssurance, 'image/png'),
        imagenInstitucional: toDataUrl(L.imagenInstitucional, 'image/png'),
        logoCSC: toDataUrl(L.logoCSC, 'image/png'),
        logoIpesa: toDataUrl(L.logoIpesa, 'image/png')
      },
      meta: {
        titulo: 'Reporte de Gestión de Flota - Nº Informe:' + " " + cliente.num_informe,
        subtitulo: 'Centro de Soluciones Conectadas — IPESA'
      }
    });

    // 3. Generar datos para RESUMEN
    const data = renderGraficosResumen(cliente.metricas);

    // 4. Generar datos para CONECTIVIDAD
    const dataConectividad = renderGraficosConectividad(cliente.equipos, modelo.periodo);

    // 5. Generar datos para UTILIZACIÓN (NUEVO)
    const dataUtilizacion = renderUtilizacion(cliente.equipos, cliente.metricas, modelo.periodo, modelo.config.precio_galon);  // ✅ Desde CONFIG

    //dtc
    const equiposDTC = (cliente.equipos || []).map(eq => ({
      id_equipo: eq.id_equipo || eq.pin || eq.num_serie || eq.numero_serie,
      pin: eq.pin || eq.num_serie || eq.numero_serie,
      modelo: eq.modelo,
      familia: eq.familia,
      num_interno: eq.num_interno,
      dtc: Array.isArray(eq.dtc) ? eq.dtc : []
    }));

    const { html: dtcHTML, resumen: dtcResumen } = renderDTC({
      equipos: equiposDTC,
      periodo: {
        ini: modelo.periodo.fecha_inicio,
        fin: modelo.periodo.fecha_fin,
        label: modelo.periodo.label
      },  // ✅ Desde CONFIG
      opciones: { ordenar: 'criticos' }
    });

    const periodoFluidos = {
      inicio: modelo.periodo.inicio,
      fin: modelo.periodo.fin
    };  // ✅ Desde CONFIG

    const htmlFluidos = generarAnalisisFluidosRenderizado(
      cliente.equipos,
      periodoFluidos,
      L
    );

    // 🔔 EXPERT ALERTS
    const expertAlertsHTML = generarEventosAlerta(
      cliente.equipos || [],
      {
        inicio: modelo.periodo.inicio,
        fin: modelo.periodo.fin
      }  // ✅ Desde CONFIG
    );

    // 💡 ACCIONES Y RECOMENDACIONES
    const accionesHTML = generarAccionesRecomendaciones(
      cliente.equipos || [],
      {
        inicio: modelo.periodo.inicio,
        fin: modelo.periodo.fin
      },
      modelo.config.precio_galon  // ✅ Desde CONFIG
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
    const jdProtectHTML = generarPaginaJohnDeereProtect(L.imagenPromoJDProtect);

    // 6. Cargar template de 4 páginas
    const htmlTemplate = HtmlService.createTemplateFromFile('reporte-flota');

    // 7. Inyectar datos al template
    htmlTemplate.portadaHTML = portadaHTML
    htmlTemplate.htmlFluidos = htmlFluidos; // 💧 Nueva sección de análisis de fluidos
    htmlTemplate.expertAlertsHTML = expertAlertsHTML;
    htmlTemplate.accionesHTML = accionesHTML;  // 💡 Acciones y Recomendaciones
    htmlTemplate.metricas = cliente.metricas;
    htmlTemplate.data = data;
    htmlTemplate.dataConectividad = dataConectividad;
    htmlTemplate.dataUtilizacion = dataUtilizacion;  // NUEVO
    htmlTemplate.dtcHTML = dtcHTML;
    htmlTemplate.contactosHTML = contactosHTML;  // 📞 Contactos
    htmlTemplate.jdProtectHTML = jdProtectHTML;  // 🛡️ John Deere Protect
    htmlTemplate.cliente = cliente;
    htmlTemplate.periodo = modelo.periodo;  // ✅ Desde CONFIG

    // 8. Evaluar template
    const htmlOutput = htmlTemplate.evaluate();

    // 9. Convertir a PDF
    const pdfBlob = htmlOutput.getAs(MimeType.PDF);
    const nombreArchivo = `TEST_4Paginas_${cliente.razon_social}_${new Date().getTime()}`;
    pdfBlob.setName(nombreArchivo + '.pdf');

    // 10. Guardar en Drive
    const file = DriveApp.createFile(pdfBlob);
    const fileUrl = file.getUrl();
    const fileSize = file.getSize();

    Logger.log(`✅ PDF generado con reporte completo: ${fileUrl}`);
    Logger.log(`📊 Tamaño: ${(fileSize / 1024).toFixed(2)} KB`);
    Logger.log(`📄 Páginas: Portada | Resumen | Conectividad | Utilización | DTC | Fluidos | Expert Alerts | Acciones | Contactos | JD Protect`);

    // Mostrar alerta
    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '✅ PDF de Prueba Generado - Reporte Completo',
      `Cliente: ${cliente.razon_social}\n\n` +
      `Páginas incluidas:\n` +
      `  1. Portada\n` +
      `  2. Resumen Ejecutivo\n` +
      `  3. Conectividad\n` +
      `  4. Utilización\n` +
      `  5. Códigos DTC\n` +
      `  6. Análisis de Fluidos\n` +
      `  7. Expert Alerts\n` +
      `  8. Acciones y Recomendaciones\n` +
      `  9. Contactos\n` +
      `  10. John Deere Protect\n\n` +
      `Archivo: ${nombreArchivo}.pdf\n` +
      `Tamaño: ${(fileSize / 1024).toFixed(2)} KB\n\n` +
      `Equipos procesados: ${dataUtilizacion.totalEquiposOperativos}\n\n` +
      `URL: ${fileUrl}\n\n` +
      `✨ Verifica que todas las secciones se vean correctamente`,
      ui.ButtonSet.OK
    );

    return {
      metodo: 'HtmlService.getAs(MimeType.PDF) - Reporte Completo',
      url: fileUrl,
      nombre: nombreArchivo + '.pdf',
      tamaño: fileSize,
      tamañoKB: (fileSize / 1024).toFixed(2),
      secciones: ['Portada', 'Resumen', 'Conectividad', 'Utilización', 'DTC', 'Fluidos', 'Expert Alerts', 'Acciones', 'Contactos', 'JD Protect'],
      equiposOperativos: dataUtilizacion.totalEquiposOperativos
    };

  } catch (error) {
    Logger.log(`❌ Error en probarPDF4PaginasConHtmlService: ${error.message}`);
    Logger.log(error.stack);
    SpreadsheetApp.getUi().alert(
      'Error',
      `Error al generar PDF de 4 páginas: ${error.message}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    throw error;
  }
}
