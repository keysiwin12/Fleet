/**
 * 🎯 Solución: Generar PDF sin imágenes pesadas (solo logos pequeños)
 * Usa esta versión si las imágenes base64 son demasiado grandes
 */
function probarPDF4PaginasSinImagenesPesadas(clienteId = "7499") {
  try {
    Logger.log("🧪 Generando PDF SIN imágenes pesadas...");

    const modelo = generarModeloConMetricas();
    const cliente = modelo.relaciones.clientes_por_opcenter[clienteId];

    if (!cliente) {
      throw new Error(`❌ Cliente ${clienteId} no encontrado`);
    }

    // ⚡ CARGAR SOLO LOGOS PEQUEÑOS (sin imágenes institucionales pesadas)
    const logosMinimos = {
      logoIpesa: getBase64ImageFromDrive("1OCebW4tVJlwSiln4mXOIaz9pi_tzSuz9"),
      logoCSC: getBase64ImageFromDrive("1LuOwO1VttPC3-cqBQE3_eWmFlxUL599M"),
      // Usar placeholders o null para imágenes grandes
      fleetAssurance: null,
      imagenInstitucional: null,
      leyendaRojo: null,
      leyendaAmarillo: null,
      leyendaNaranja: null,
      imagenAceite: null,
      modemM: null,
      jDProtect: null
    };

    const toDataUrl = (b64, mime='image/png') => {
      if (!b64) return '';  // Retorna vacío si no hay imagen
      return b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`;
    };

    // Generar solo portada simple (sin imágenes institucionales)
    const portadaSimple = `
      <div class="page portada">
        <div style="padding:40px; text-align:center;">
          <h1 style="font-size:24pt; margin-bottom:20px;">${cliente.razon_social || 'Cliente'}</h1>
          <h2 style="font-size:18pt; color:#666;">Reporte de Gestión de Flota</h2>
          <p style="margin-top:20px; font-size:12pt;">
            Periodo: ${modelo.periodo.inicio} — ${modelo.periodo.fin}
          </p>
        </div>
      </div>
    `;

    // Generar solo secciones livianas
    const dataResumen = renderGraficosResumen(cliente.metricas);
    const recomendacionesHTML = buildRecomendaciones(cliente.metricas);
    const dataConectividad = renderGraficosConectividad(cliente.equipos, modelo.periodo);
    const dataUtilizacion = renderUtilizacion(
      cliente.equipos,
      cliente.metricas,
      modelo.periodo,
      modelo.config.precio_galon
    );

    // Template simplificado
    const htmlTemplate = HtmlService.createTemplateFromFile('reporte-flota');
    htmlTemplate.portadaHTML = portadaSimple;  // Portada simplificada
    htmlTemplate.htmlFluidos = '<div></div>';  // Sin fluidos (puede ser pesado)
    htmlTemplate.expertAlertsHTML = '<div></div>';  // Sin alerts (puede ser pesado)
    htmlTemplate.metricas = cliente.metricas;
    htmlTemplate.data = dataResumen;
    htmlTemplate.accionesHTML = '<div></div>';  // Sin acciones
    htmlTemplate.recomendacionesHTML = recomendacionesHTML;
    htmlTemplate.dataConectividad = dataConectividad;
    htmlTemplate.dataUtilizacion = dataUtilizacion;
    htmlTemplate.dtcHTML = '<div><p>Sección DTC omitida en versión ligera</p></div>';
    htmlTemplate.cliente = cliente;
    htmlTemplate.periodo = modelo.periodo;

    // Convertir a PDF
    const htmlOutput = htmlTemplate.evaluate();
    Logger.log("✅ HTML generado, intentando conversión a PDF...");

    const pdfBlob = htmlOutput.getAs(MimeType.PDF);
    const nombreArchivo = `TEST_Ligero_${cliente.razon_social}_${new Date().getTime()}`;
    pdfBlob.setName(nombreArchivo + '.pdf');

    // Guardar en Drive
    const file = DriveApp.createFile(pdfBlob);
    const fileUrl = file.getUrl();
    const fileSize = file.getSize();

    Logger.log(`✅ PDF LIGERO generado: ${fileUrl}`);
    Logger.log(`📊 Tamaño: ${(fileSize / 1024).toFixed(2)} KB`);

    SpreadsheetApp.getUi().alert(
      '✅ PDF Ligero Generado',
      `Cliente: ${cliente.razon_social}\n` +
      `Secciones: Resumen + Recomendaciones + Conectividad + Utilización\n` +
      `(Sin: Fluidos, Expert Alerts, DTC, Acciones)\n\n` +
      `Tamaño: ${(fileSize / 1024).toFixed(2)} KB\n` +
      `URL: ${fileUrl}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return { url: fileUrl, tamaño: fileSize };

  } catch (error) {
    Logger.log(`❌ Error: ${error.message}`);
    Logger.log(error.stack);
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * 🎯 Solución: Limitar equipos en tablas
 */
function probarPDF4PaginasConLimiteEquipos(clienteId = "7499", maxEquipos = 20) {
  try {
    Logger.log(`🧪 Generando PDF limitado a ${maxEquipos} equipos...`);

    const modelo = generarModeloConMetricas();
    const cliente = modelo.relaciones.clientes_por_opcenter[clienteId];

    if (!cliente) {
      throw new Error(`❌ Cliente ${clienteId} no encontrado`);
    }

    // ⚡ LIMITAR EQUIPOS
    const clienteLimitado = {
      ...cliente,
      equipos: (cliente.equipos || []).slice(0, maxEquipos)
    };

    Logger.log(`📊 Cliente tiene ${cliente.equipos.length} equipos, limitando a ${clienteLimitado.equipos.length}`);

    // Usar el flujo normal pero con equipos limitados
    const L = cargarLogosBase64();
    const toDataUrl = (b64, mime='image/png') => b64 ? (b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`) : '';

    const { html: portadaHTML } = renderPortada2Paginas({
      cliente: {
        razon_social: clienteLimitado.razon_social || 'Cliente',
        ruc: clienteLimitado.ruc || clienteLimitado.nif || '',
        segmento: clienteLimitado.segmento || clienteLimitado.tipo || ''
      },
      periodo: modelo.periodo,
      images: {
        fleetAssurance: toDataUrl(L.fleetAssurance, 'image/png'),
        imagenInstitucional: toDataUrl(L.imagenInstitucional, 'image/png'),
        logoCSC: toDataUrl(L.logoCSC, 'image/png'),
        logoIpesa: toDataUrl(L.logoIpesa, 'image/png')
      },
      meta: {
        titulo: 'Reporte de Gestión de Flota (Limitado)',
        subtitulo: 'Centro de Soluciones Conectadas — IPESA'
      }
    });

    const dataResumen = renderGraficosResumen(clienteLimitado.metricas);
    const recomendacionesHTML = buildRecomendaciones(clienteLimitado.metricas);
    const dataConectividad = renderGraficosConectividad(clienteLimitado.equipos, modelo.periodo);
    const dataUtilizacion = renderUtilizacion(
      clienteLimitado.equipos,
      clienteLimitado.metricas,
      modelo.periodo,
      modelo.config.precio_galon
    );

    // Template con equipos limitados
    const htmlTemplate = HtmlService.createTemplateFromFile('reporte-flota');
    htmlTemplate.portadaHTML = portadaHTML;
    htmlTemplate.htmlFluidos = '<div><p>Sección de fluidos omitida (versión limitada)</p></div>';
    htmlTemplate.expertAlertsHTML = '<div><p>Sección de expert alerts omitida (versión limitada)</p></div>';
    htmlTemplate.metricas = clienteLimitado.metricas;
    htmlTemplate.data = dataResumen;
    htmlTemplate.accionesHTML = '<div></div>';
    htmlTemplate.recomendacionesHTML = recomendacionesHTML;
    htmlTemplate.dataConectividad = dataConectividad;
    htmlTemplate.dataUtilizacion = dataUtilizacion;
    htmlTemplate.dtcHTML = '<div><p>Sección DTC omitida (versión limitada)</p></div>';
    htmlTemplate.cliente = clienteLimitado;
    htmlTemplate.periodo = modelo.periodo;

    // Convertir a PDF
    const htmlOutput = htmlTemplate.evaluate();
    const pdfBlob = htmlOutput.getAs(MimeType.PDF);
    const nombreArchivo = `TEST_Limitado${maxEquipos}_${clienteLimitado.razon_social}_${new Date().getTime()}`;
    pdfBlob.setName(nombreArchivo + '.pdf');

    // Guardar en Drive
    const file = DriveApp.createFile(pdfBlob);
    const fileUrl = file.getUrl();
    const fileSize = file.getSize();

    Logger.log(`✅ PDF LIMITADO generado: ${fileUrl}`);
    Logger.log(`📊 Tamaño: ${(fileSize / 1024).toFixed(2)} KB`);

    SpreadsheetApp.getUi().alert(
      '✅ PDF Limitado Generado',
      `Cliente: ${clienteLimitado.razon_social}\n` +
      `Equipos mostrados: ${clienteLimitado.equipos.length} de ${cliente.equipos.length}\n` +
      `Tamaño: ${(fileSize / 1024).toFixed(2)} KB\n\n` +
      `URL: ${fileUrl}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );

    return { url: fileUrl, tamaño: fileSize };

  } catch (error) {
    Logger.log(`❌ Error: ${error.message}`);
    Logger.log(error.stack);
    SpreadsheetApp.getUi().alert('Error', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}
