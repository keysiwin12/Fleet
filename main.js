function main() {
  const datos = extraerDatosHojas();  // ✅ Agregado const
  const precioPorGalon = datos.config.precio_galon;  // ✅ Desde CONFIG
  const pdfPorCliente = generarPDF(datos, precioPorGalon);
  //enviarPDFsPorCorreo(pdfPorCliente, datos.contactos);
}
