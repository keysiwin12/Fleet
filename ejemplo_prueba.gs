/**
 * 🧪 FUNCIÓN DE PRUEBA RÁPIDA
 * Ejecuta esto en Google Apps Script para verificar los estilos
 */
function probarEstilosCorregidos() {
  // Usar cliente de ejemplo (cambia "7499" por un ID válido de tu base de datos)
  const clienteId = "7499";
  
  Logger.log("🚀 Iniciando prueba de estilos CSS corregidos...");
  Logger.log("📋 Cliente ID: " + clienteId);
  
  // Ejecutar la función de prueba existente
  probarPDF4PaginasConHtmlService(clienteId);
  
  Logger.log("✅ PDF generado - Revisa el popup con el enlace al archivo");
}
