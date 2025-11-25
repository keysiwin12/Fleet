/**************************************
 * 🚀 SISTEMA DE PROCESAMIENTO POR LOTES
 *
 * Divide la generación de 222 PDFs en 3 lotes de 75 clientes
 * para evitar el límite de 30 minutos de Google Apps Script.
 *
 * FUNCIONES PRINCIPALES:
 * - iniciarProcesamientoLotes(): Inicia el proceso completo
 * - procesarLote(): Procesa un lote específico
 * - detenerProcesamientoLotes(): Cancela todos los triggers pendientes
 * - eliminarTriggersAntiguos(): Limpia triggers antiguos
 * - verProgresoLotes(): Dashboard de progreso
 **************************************/

const CONFIG_LOTES = {
  CLIENTES_POR_LOTE: 75,
  PAUSA_ENTRE_LOTES_MIN: 3,
  NOMBRE_HOJA_CONTROL: 'BATCH_CONTROL',
  TAG_TRIGGER: 'batch_processing_fleet'
};

/**
 * 🎬 PASO 1: Inicia el procesamiento por lotes
 *
 * Divide todos los clientes en lotes y programa el primer lote.
 * Los lotes subsecuentes se programan automáticamente.
 *
 * @returns {Object} Estado inicial del procesamiento
 */
function iniciarProcesamientoLotes() {
  try {
    Logger.log('🚀 Iniciando procesamiento por lotes...');

    // 1. Verificar y eliminar triggers antiguos
    eliminarTriggersAntiguos();

    // 2. Inicializar hoja de control
    const hojaControl = inicializarHojaControl();

    // 3. Obtener IDs de todos los clientes
    Logger.log('📊 Cargando modelo de datos...');
    const modelo = generarModeloConMetricas();
    const mapaClientes = (modelo.relaciones && modelo.relaciones.clientes_por_opcenter) || {};
    const todosLosIds = Object.keys(mapaClientes);
    const totalClientes = todosLosIds.length;

    if (totalClientes === 0) {
      throw new Error('No hay clientes para procesar. Verifica la hoja Z_CLIENTES.');
    }

    const clientesPorLote = CONFIG_LOTES.CLIENTES_POR_LOTE;
    const numLotes = Math.ceil(totalClientes / clientesPorLote);

    Logger.log(`📊 Total clientes: ${totalClientes}`);
    Logger.log(`📦 Lotes a procesar: ${numLotes}`);
    Logger.log(`👥 Clientes por lote: ${clientesPorLote}`);

    // 4. Guardar IDs de clientes en Properties (para que los triggers los usen)
    PropertiesService.getScriptProperties().setProperty('todosLosIds', JSON.stringify(todosLosIds));

    // 5. Registrar configuración en la hoja de control
    const ahora = new Date();
    hojaControl.getRange('B2').setValue(ahora); // Fecha inicio
    hojaControl.getRange('B3').setValue(totalClientes); // Total clientes
    hojaControl.getRange('B4').setValue(numLotes); // Total lotes
    hojaControl.getRange('B5').setValue(0); // Lotes completados
    hojaControl.getRange('B6').setValue(0); // PDFs generados
    hojaControl.getRange('B7').setValue(0); // Correos enviados
    hojaControl.getRange('B8').setValue('EN PROCESO');

    // 6. Crear registros de lotes
    const filaInicio = 12; // Fila donde empiezan los lotes
    for (let i = 0; i < numLotes; i++) {
      const inicio = i * clientesPorLote;
      const fin = Math.min(inicio + clientesPorLote, totalClientes);
      const fila = filaInicio + i;

      hojaControl.getRange(fila, 1).setValue(`Lote ${i + 1}`);
      hojaControl.getRange(fila, 2).setValue(`${inicio + 1}-${fin}`);
      hojaControl.getRange(fila, 3).setValue(fin - inicio);
      hojaControl.getRange(fila, 4).setValue('PENDIENTE');
      hojaControl.getRange(fila, 5).setValue('');
      hojaControl.getRange(fila, 6).setValue('');
      hojaControl.getRange(fila, 7).setValue('');
      hojaControl.getRange(fila, 8).setValue('');
    }

    // 7. Programar el PRIMER lote para que inicie INMEDIATAMENTE
    ScriptApp.newTrigger('ejecutarPrimerLote')
      .timeBased()
      .after(5000) // 5 segundos después
      .create();

    Logger.log('✅ Sistema iniciado. Primer lote se ejecutará en 5 segundos.');

    return {
      status: 'INICIADO',
      totalClientes: totalClientes,
      numLotes: numLotes,
      primerLoteEn: '5 segundos'
    };

  } catch (error) {
    Logger.log(`❌ Error al iniciar procesamiento: ${error.message}`);
    Logger.log(error.stack);
    throw error;
  }
}

/**
 * 🎯 FUNCIÓN AUXILIAR: Ejecuta el primer lote
 * (Llamada automáticamente por el trigger)
 */
function ejecutarPrimerLote() {
  procesarLote(1);
}

/**
 * ⚙️ PASO 2: Procesa un lote específico de clientes
 *
 * @param {number} numLote - Número del lote (1, 2, 3)
 */
function procesarLote(numLote) {
  const inicioEjecucion = new Date();
  Logger.log(`\n${'='.repeat(60)}`);
  Logger.log(`🔄 PROCESANDO LOTE ${numLote}`);
  Logger.log(`${'='.repeat(60)}\n`);

  try {
    // 1. Obtener hoja de control
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaControl = ss.getSheetByName(CONFIG_LOTES.NOMBRE_HOJA_CONTROL);
    const filaLote = 11 + numLote; // Fila del lote en la hoja

    // 2. Actualizar estado a "PROCESANDO"
    hojaControl.getRange(filaLote, 4).setValue('PROCESANDO');
    hojaControl.getRange(filaLote, 5).setValue(inicioEjecucion);
    SpreadsheetApp.flush(); // Forzar actualización visual

    // 3. Obtener IDs de clientes
    const props = PropertiesService.getScriptProperties();
    const todosLosIds = JSON.parse(props.getProperty('todosLosIds'));

    if (!todosLosIds || todosLosIds.length === 0) {
      throw new Error('No se encontraron IDs de clientes en Properties.');
    }

    const clientesPorLote = CONFIG_LOTES.CLIENTES_POR_LOTE;
    const indiceInicio = (numLote - 1) * clientesPorLote;
    const indiceFin = Math.min(indiceInicio + clientesPorLote, todosLosIds.length);
    const idsDelLote = todosLosIds.slice(indiceInicio, indiceFin);

    Logger.log(`👥 Clientes en este lote: ${idsDelLote.length}`);
    Logger.log(`📋 Rango: ${indiceInicio + 1} a ${indiceFin} de ${todosLosIds.length}`);

    // 4. Cargar modelo completo (necesario para generar PDFs y enviar correos)
    Logger.log('📊 Cargando modelo de datos...');
    const modelo = generarModeloConMetricas();
    const mapaClientes = modelo.relaciones.clientes_por_opcenter;

    // 5. Generar PDFs para este lote usando la función existente
    Logger.log(`📄 Generando PDFs para ${idsDelLote.length} clientes...`);
    const resultadosPDF = probarPDF4PaginasTodos({ onlyIds: idsDelLote });

    let pdfsGenerados = resultadosPDF.ok || 0;
    let errores = [];

    // 6. Enviar correos para los PDFs generados exitosamente
    Logger.log(`📧 Enviando correos...`);
    let correosEnviados = 0;

    resultadosPDF.resultados.forEach(resultado => {
      if (resultado.ok) {
        const clienteId = resultado.clienteId;
        const clienteData = mapaClientes[clienteId];

        try {
          // Extraer file ID de la URL del PDF
          const match = resultado.url.match(/[-\w]{25,}/);
          if (match && match[0]) {
            const pdfFileId = match[0];
            enviarCorreoCliente(clienteData, pdfFileId);
            correosEnviados++;
            Logger.log(`✅ Correo enviado: ${clienteData.razon_social}`);
          } else {
            Logger.log(`⚠️ No se pudo extraer file ID de: ${resultado.url}`);
          }
        } catch (errorCorreo) {
          const mensajeError = `Error al enviar correo a ${clienteData.razon_social}: ${errorCorreo.message}`;
          Logger.log(`❌ ${mensajeError}`);
          errores.push(mensajeError);
        }
      } else {
        errores.push(`Error en cliente ${resultado.clienteId}: ${resultado.error}`);
      }
    });

    const finEjecucion = new Date();
    const duracionMin = ((finEjecucion - inicioEjecucion) / 1000 / 60).toFixed(2);

    // 7. Actualizar resultados del lote
    hojaControl.getRange(filaLote, 4).setValue('COMPLETADO');
    hojaControl.getRange(filaLote, 6).setValue(finEjecucion);
    hojaControl.getRange(filaLote, 7).setValue(`${duracionMin} min`);
    hojaControl.getRange(filaLote, 8).setValue(errores.length > 0 ? errores.slice(0, 3).join('; ') : 'Sin errores');

    // 8. Actualizar totales globales
    const lotesCompletados = hojaControl.getRange('B5').getValue() + 1;
    const pdfsGlobales = hojaControl.getRange('B6').getValue() + pdfsGenerados;
    const correosGlobales = hojaControl.getRange('B7').getValue() + correosEnviados;

    hojaControl.getRange('B5').setValue(lotesCompletados);
    hojaControl.getRange('B6').setValue(pdfsGlobales);
    hojaControl.getRange('B7').setValue(correosGlobales);

    // 9. Determinar si hay más lotes pendientes
    const numLotesTotales = hojaControl.getRange('B4').getValue();
    const hayMasLotes = numLote < numLotesTotales;

    Logger.log(`\n📊 RESUMEN LOTE ${numLote}:`);
    Logger.log(`   ✅ PDFs generados: ${pdfsGenerados}`);
    Logger.log(`   📧 Correos enviados: ${correosEnviados}`);
    Logger.log(`   ❌ Errores: ${errores.length}`);
    Logger.log(`   ⏱️ Duración: ${duracionMin} minutos`);

    if (hayMasLotes) {
      // 10. Programar el SIGUIENTE lote
      const siguienteLote = numLote + 1;
      const pausaMs = CONFIG_LOTES.PAUSA_ENTRE_LOTES_MIN * 60 * 1000;

      ScriptApp.newTrigger('ejecutarSiguienteLote')
        .timeBased()
        .after(pausaMs)
        .create();

      // Guardar datos del siguiente lote en Properties (para que el trigger los use)
      props.setProperty('siguienteLote', siguienteLote.toString());

      Logger.log(`\n⏭️ Siguiente lote (${siguienteLote}) programado en ${CONFIG_LOTES.PAUSA_ENTRE_LOTES_MIN} minutos`);

      // Actualizar estado del siguiente lote
      const filaProxLote = 11 + siguienteLote;
      hojaControl.getRange(filaProxLote, 4).setValue('PROGRAMADO');

    } else {
      // 11. Proceso completo
      hojaControl.getRange('B8').setValue('COMPLETADO');
      hojaControl.getRange('B9').setValue(finEjecucion);

      Logger.log(`\n${'🎉'.repeat(30)}`);
      Logger.log(`✅ PROCESO COMPLETADO`);
      Logger.log(`📊 Total PDFs generados: ${pdfsGlobales}`);
      Logger.log(`📧 Total correos enviados: ${correosGlobales}`);
      Logger.log(`${'🎉'.repeat(30)}\n`);

      // Limpiar properties
      PropertiesService.getScriptProperties().deleteAllProperties();
    }

  } catch (error) {
    Logger.log(`❌ ERROR CRÍTICO EN LOTE ${numLote}: ${error.message}`);
    Logger.log(error.stack);

    // Registrar error en la hoja
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaControl = ss.getSheetByName(CONFIG_LOTES.NOMBRE_HOJA_CONTROL);
    const filaLote = 11 + numLote;

    hojaControl.getRange(filaLote, 4).setValue('ERROR');
    hojaControl.getRange(filaLote, 8).setValue(error.message.substring(0, 200));
    hojaControl.getRange('B8').setValue('ERROR');

    throw error;
  }
}

/**
 * 🔄 FUNCIÓN AUXILIAR: Ejecuta el siguiente lote programado
 * (Llamada automáticamente por los triggers encadenados)
 */
function ejecutarSiguienteLote() {
  const props = PropertiesService.getScriptProperties();
  const numLote = parseInt(props.getProperty('siguienteLote'));

  if (!numLote || isNaN(numLote)) {
    Logger.log('❌ No se encontró información del siguiente lote en Properties.');
    return;
  }

  procesarLote(numLote);
}

/**
 * 🛑 DETENER PROCESAMIENTO: Cancela todos los triggers pendientes
 *
 * Útil si necesitas detener el proceso antes de que termine.
 * Los lotes ya completados NO se revierten.
 */
function detenerProcesamientoLotes() {
  try {
    Logger.log('🛑 Deteniendo procesamiento por lotes...');

    const triggers = ScriptApp.getProjectTriggers();
    let eliminados = 0;

    triggers.forEach(trigger => {
      const handlerFunction = trigger.getHandlerFunction();

      // Eliminar triggers relacionados con el batch processing
      if (handlerFunction === 'ejecutarPrimerLote' ||
          handlerFunction === 'ejecutarSiguienteLote') {
        ScriptApp.deleteTrigger(trigger);
        eliminados++;
        Logger.log(`   ✅ Trigger eliminado: ${handlerFunction}`);
      }
    });

    // Actualizar estado en la hoja
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaControl = ss.getSheetByName(CONFIG_LOTES.NOMBRE_HOJA_CONTROL);

    if (hojaControl) {
      const estadoActual = hojaControl.getRange('B8').getValue();
      if (estadoActual === 'EN PROCESO') {
        hojaControl.getRange('B8').setValue('DETENIDO MANUALMENTE');
        hojaControl.getRange('B9').setValue(new Date());
      }
    }

    // Limpiar properties
    PropertiesService.getScriptProperties().deleteAllProperties();

    Logger.log(`\n✅ Procesamiento detenido. ${eliminados} trigger(s) eliminado(s).`);

    return {
      status: 'DETENIDO',
      triggersEliminados: eliminados
    };

  } catch (error) {
    Logger.log(`❌ Error al detener procesamiento: ${error.message}`);
    throw error;
  }
}

/**
 * 🧹 LIMPIEZA: Elimina triggers antiguos del sistema
 *
 * Se ejecuta automáticamente al iniciar un nuevo procesamiento.
 * También puede ejecutarse manualmente para limpiar.
 */
function eliminarTriggersAntiguos() {
  try {
    Logger.log('🧹 Limpiando triggers antiguos...');

    const triggers = ScriptApp.getProjectTriggers();
    let eliminados = 0;

    triggers.forEach(trigger => {
      const handlerFunction = trigger.getHandlerFunction();

      // Eliminar TODOS los triggers relacionados con batch processing
      if (handlerFunction === 'ejecutarPrimerLote' ||
          handlerFunction === 'ejecutarSiguienteLote') {
        ScriptApp.deleteTrigger(trigger);
        eliminados++;
        Logger.log(`   ✅ Trigger antiguo eliminado: ${handlerFunction}`);
      }
    });

    if (eliminados > 0) {
      Logger.log(`✅ ${eliminados} trigger(s) antiguo(s) eliminado(s).`);
    } else {
      Logger.log('ℹ️ No se encontraron triggers antiguos.');
    }

    return eliminados;

  } catch (error) {
    Logger.log(`❌ Error al eliminar triggers antiguos: ${error.message}`);
    throw error;
  }
}

/**
 * 📊 DASHBOARD: Ver progreso del procesamiento por lotes
 *
 * @returns {Object} Estado actual del procesamiento
 */
function verProgresoLotes() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const hojaControl = ss.getSheetByName(CONFIG_LOTES.NOMBRE_HOJA_CONTROL);

    if (!hojaControl) {
      return {
        status: 'NO_INICIADO',
        mensaje: 'No se ha iniciado ningún procesamiento por lotes.'
      };
    }

    const fechaInicio = hojaControl.getRange('B2').getValue();
    const totalClientes = hojaControl.getRange('B3').getValue();
    const totalLotes = hojaControl.getRange('B4').getValue();
    const lotesCompletados = hojaControl.getRange('B5').getValue();
    const pdfsGenerados = hojaControl.getRange('B6').getValue();
    const correosEnviados = hojaControl.getRange('B7').getValue();
    const estado = hojaControl.getRange('B8').getValue();
    const fechaFin = hojaControl.getRange('B9').getValue();

    const progreso = totalLotes > 0 ? Math.round((lotesCompletados / totalLotes) * 100) : 0;

    const resultado = {
      estado: estado,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin || 'En proceso',
      totalClientes: totalClientes,
      totalLotes: totalLotes,
      lotesCompletados: lotesCompletados,
      lotePendientes: totalLotes - lotesCompletados,
      progreso: `${progreso}%`,
      pdfsGenerados: pdfsGenerados,
      correosEnviados: correosEnviados
    };

    // Mostrar en consola
    Logger.log('\n📊 PROGRESO DEL PROCESAMIENTO POR LOTES');
    Logger.log('═'.repeat(50));
    Logger.log(`Estado: ${resultado.estado}`);
    Logger.log(`Progreso: ${resultado.progreso} (${lotesCompletados}/${totalLotes} lotes)`);
    Logger.log(`PDFs generados: ${pdfsGenerados}/${totalClientes}`);
    Logger.log(`Correos enviados: ${correosEnviados}`);
    Logger.log(`Inicio: ${fechaInicio}`);
    if (fechaFin) Logger.log(`Fin: ${fechaFin}`);
    Logger.log('═'.repeat(50));

    return resultado;

  } catch (error) {
    Logger.log(`❌ Error al obtener progreso: ${error.message}`);
    throw error;
  }
}

/**
 * 🗂️ INICIALIZACIÓN: Crea/resetea la hoja BATCH_CONTROL
 *
 * @returns {Sheet} Hoja de control inicializada
 */
function inicializarHojaControl() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hojaControl = ss.getSheetByName(CONFIG_LOTES.NOMBRE_HOJA_CONTROL);

  // Si existe, limpiarla; si no, crearla
  if (hojaControl) {
    hojaControl.clear();
  } else {
    hojaControl = ss.insertSheet(CONFIG_LOTES.NOMBRE_HOJA_CONTROL);
  }

  // Configurar encabezados
  hojaControl.getRange('A1:B1').setValues([['🚀 CONTROL DE PROCESAMIENTO POR LOTES', '']]);
  hojaControl.getRange('A1:B1').setFontWeight('bold').setFontSize(14);

  // Información general
  hojaControl.getRange('A2:B9').setValues([
    ['Fecha Inicio', ''],
    ['Total Clientes', ''],
    ['Total Lotes', ''],
    ['Lotes Completados', ''],
    ['PDFs Generados', ''],
    ['Correos Enviados', ''],
    ['Estado', ''],
    ['Fecha Fin', '']
  ]);

  hojaControl.getRange('A2:A9').setFontWeight('bold');

  // Encabezados de tabla de lotes
  hojaControl.getRange('A11:H11').setValues([[
    'Lote', 'Rango Clientes', 'Cantidad', 'Estado', 'Inicio', 'Fin', 'Duración', 'Errores'
  ]]);
  hojaControl.getRange('A11:H11').setFontWeight('bold').setBackground('#4285F4').setFontColor('#FFFFFF');

  // Ajustar anchos de columna
  hojaControl.setColumnWidth(1, 100);  // Lote
  hojaControl.setColumnWidth(2, 150);  // Rango
  hojaControl.setColumnWidth(3, 80);   // Cantidad
  hojaControl.setColumnWidth(4, 120);  // Estado
  hojaControl.setColumnWidth(5, 150);  // Inicio
  hojaControl.setColumnWidth(6, 150);  // Fin
  hojaControl.setColumnWidth(7, 100);  // Duración
  hojaControl.setColumnWidth(8, 300);  // Errores

  return hojaControl;
}

/**
 * 🧪 FUNCIÓN DE PRUEBA: Simula procesamiento con 5 clientes
 *
 * Útil para probar el sistema antes del procesamiento real.
 */
function probarSistemaPorLotes() {
  Logger.log('🧪 Ejecutando prueba del sistema por lotes...');

  // Temporalmente cambiar configuración para prueba
  const configOriginal = CONFIG_LOTES.CLIENTES_POR_LOTE;
  CONFIG_LOTES.CLIENTES_POR_LOTE = 2; // 2 clientes por lote

  try {
    iniciarProcesamientoLotes();
    Logger.log('✅ Prueba iniciada. Revisa la hoja BATCH_CONTROL.');
  } catch (error) {
    Logger.log(`❌ Error en prueba: ${error.message}`);
  } finally {
    // Restaurar configuración original
    CONFIG_LOTES.CLIENTES_POR_LOTE = configOriginal;
  }
}
