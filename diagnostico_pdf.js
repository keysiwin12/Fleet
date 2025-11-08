/**
 * 🔍 Diagnóstico: Encuentra cliente con menos equipos para pruebas
 */
function encontrarClientePequeno() {
  const modelo = generarModeloConMetricas();
  const clientes = modelo.relaciones.clientes_por_opcenter;

  // Ordenar por cantidad de equipos (menor a mayor)
  const clientesOrdenados = Object.entries(clientes)
    .map(([id, cliente]) => ({
      id: id,
      razon_social: cliente.razon_social,
      equipos: (cliente.equipos || []).length,
      es_cbd: cliente.es_cbd,
      es_signature: cliente.es_signature
    }))
    .sort((a, b) => a.equipos - b.equipos);

  Logger.log("📊 Clientes ordenados por cantidad de equipos (menor a mayor):");
  Logger.log("=" .repeat(80));

  clientesOrdenados.slice(0, 10).forEach((c, idx) => {
    Logger.log(`${idx + 1}. ID: ${c.id} | ${c.razon_social} | Equipos: ${c.equipos}`);
  });

  Logger.log("=" .repeat(80));
  Logger.log(`✅ Cliente más pequeño: ${clientesOrdenados[0].razon_social} (${clientesOrdenados[0].equipos} equipos)`);
  Logger.log(`   ID: ${clientesOrdenados[0].id}`);

  return clientesOrdenados[0].id;
}

/**
 * 🧪 Prueba con cliente pequeño
 */
function probarConClientePequeno() {
  const clienteId = encontrarClientePequeno();
  Logger.log(`\n🧪 Probando PDF con cliente pequeño: ${clienteId}`);
  probarPDF4PaginasConHtmlService(clienteId);
}

/**
 * 📊 Diagnóstico completo del HTML generado
 */
function diagnosticarTamanoHTML() {
  const modelo = generarModeloConMetricas();
  const clienteId = "7499"; // Cliente actual que falla
  const cliente = modelo.relaciones.clientes_por_opcenter[clienteId];

  if (!cliente) {
    Logger.log("❌ Cliente no encontrado");
    return;
  }

  // Cargar logos
  const L = cargarLogosBase64();
  const toDataUrl = (b64, mime='image/png') => b64 ? (b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`) : '';

  Logger.log("📊 DIAGNÓSTICO DE TAMAÑO HTML");
  Logger.log("=" .repeat(80));
  Logger.log(`Cliente: ${cliente.razon_social}`);
  Logger.log(`Equipos: ${(cliente.equipos || []).length}`);
  Logger.log("");

  // Tamaño de cada imagen
  Logger.log("🖼️  TAMAÑO DE IMÁGENES BASE64:");
  const imagenes = [
    { nombre: "logoIpesa", base64: L.logoIpesa },
    { nombre: "logoCSC", base64: L.logoCSC },
    { nombre: "fleetAssurance", base64: L.fleetAssurance },
    { nombre: "imagenInstitucional", base64: L.imagenInstitucional },
    { nombre: "leyendaRojo", base64: L.leyendaRojo },
    { nombre: "leyendaAmarillo", base64: L.leyendaAmarillo },
    { nombre: "leyendaNaranja", base64: L.leyendaNaranja },
    { nombre: "imagenAceite", base64: L.imagenAceite },
    { nombre: "modemM", base64: L.modemM },
    { nombre: "jDProtect", base64: L.jDProtect }
  ];

  let totalImagenes = 0;
  imagenes.forEach(img => {
    const tamano = img.base64 ? img.base64.length : 0;
    const tamanoKB = (tamano / 1024).toFixed(2);
    Logger.log(`  • ${img.nombre}: ${tamanoKB} KB`);
    totalImagenes += tamano;
  });

  Logger.log(`  TOTAL IMÁGENES: ${(totalImagenes / 1024).toFixed(2)} KB`);
  Logger.log("");

  // Tamaño de cada sección HTML
  Logger.log("📄 TAMAÑO DE SECCIONES HTML:");

  try {
    const { html: portadaHTML } = renderPortada2Paginas({
      cliente: {
        razon_social: cliente.razon_social || 'Cliente',
        ruc: cliente.ruc || cliente.nif || '',
        segmento: cliente.segmento || cliente.tipo || ''
      },
      periodo: modelo.periodo,
      images: {
        fleetAssurance: toDataUrl(L.fleetAssurance, 'image/png'),
        imagenInstitucional: toDataUrl(L.imagenInstitucional, 'image/png'),
        logoCSC: toDataUrl(L.logoCSC, 'image/png'),
        logoIpesa: toDataUrl(L.logoIpesa, 'image/png')
      },
      meta: {
        titulo: 'Reporte de Gestión de Flota',
        subtitulo: 'Centro de Soluciones Conectadas — IPESA'
      }
    });
    Logger.log(`  • Portada: ${(portadaHTML.length / 1024).toFixed(2)} KB`);

    const dataResumen = renderGraficosResumen(cliente.metricas);
    Logger.log(`  • Resumen: ${(JSON.stringify(dataResumen).length / 1024).toFixed(2)} KB`);

    const dataConectividad = renderGraficosConectividad(cliente.equipos, modelo.periodo);
    Logger.log(`  • Conectividad: ${(JSON.stringify(dataConectividad).length / 1024).toFixed(2)} KB`);

    const dataUtilizacion = renderUtilizacion(cliente.equipos, cliente.metricas, modelo.periodo, modelo.config.precio_galon);
    Logger.log(`  • Utilización: ${(JSON.stringify(dataUtilizacion).length / 1024).toFixed(2)} KB`);

    const equiposDTC = (cliente.equipos || []).map(eq => ({
      id_equipo: eq.id_equipo,
      pin: eq.pin,
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
      },
      opciones: { ordenar: 'criticos' }
    });
    Logger.log(`  • DTC: ${(dtcHTML.length / 1024).toFixed(2)} KB`);

    Logger.log("");
    Logger.log("=" .repeat(80));

    const totalEstimado = totalImagenes + portadaHTML.length + dtcHTML.length + 50000; // +50KB estimado para el resto
    Logger.log(`📦 TAMAÑO TOTAL ESTIMADO: ${(totalEstimado / 1024 / 1024).toFixed(2)} MB`);

    if (totalEstimado > 3 * 1024 * 1024) {
      Logger.log("⚠️  ADVERTENCIA: El HTML supera 3 MB, puede fallar la conversión a PDF");
    } else {
      Logger.log("✅ El HTML está dentro del límite (< 3 MB)");
    }

  } catch (error) {
    Logger.log(`❌ Error al generar secciones: ${error.message}`);
  }
}
