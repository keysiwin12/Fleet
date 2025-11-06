function main() {
  datos = extraerDatosHojas();
  const precioPorGalon = 3.75; 
  const pdfPorCliente = generarPDF(datos,precioPorGalon);
  //enviarPDFsPorCorreo(pdfPorCliente, datos.contactos);
}
