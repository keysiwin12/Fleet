// ============================================================================
// GUARDAR: PDF → GOOGLE DRIVE
// ============================================================================

/**
 * Guarda el PDF en la carpeta correcta de Google Drive según tipo de cliente
 * @param {Blob} pdfBlob - PDF Blob a guardar
 * @param {Object} cliente - Objeto del cliente
 * @param {Object} carpetas - Objeto con carpetas de destino {clientes, cbd, signature}
 * @returns {Object} {fileId: "xxx", url: "https://...", carpeta: "CBD"}
 */
function guardarPDFEnDrive(pdfBlob, cliente, carpetas) {

  Logger.log(`💾 Guardando PDF en Drive para: ${cliente.razon_social}`);

  try {
    // Determinar carpeta según tipo de cliente
    let carpetaDestino;
    let tipoCliente;

    if (cliente.es_cbd === true) {
      carpetaDestino = carpetas.cbd;
      tipoCliente = "CBD";
    } else if (cliente.es_signature === true) {
      carpetaDestino = carpetas.signature;
      tipoCliente = "Signature";
    } else {
      carpetaDestino = carpetas.clientes;
      tipoCliente = "Estándar";
    }

    // Crear archivo en Drive
    const archivo = carpetaDestino.createFile(pdfBlob);

    Logger.log(`✅ PDF guardado en carpeta ${tipoCliente}: ${archivo.getUrl()}`);

    return {
      fileId: archivo.getId(),
      url: archivo.getUrl(),
      nombre: archivo.getName(),
      carpeta: tipoCliente
    };

  } catch (error) {
    Logger.log(`❌ Error al guardar PDF en Drive: ${error.message}`);
    throw new Error(`Error al guardar en Drive: ${error.message}`);
  }
}




