/**
 * Función de prueba para previsualizar la sección de Conectividad
 * Muestra en el navegador cómo se verá la sección con datos reales
 */
function previsualizarConectividad() {
  // 1. Obtener el modelo completo con métricas calculadas
  const modelo = generarModeloConMetricas();
  
  // 2. Seleccionar un cliente (cambia el ID según necesites)
  const cliente = modelo.relaciones.clientes_por_opcenter["7499"];
  
  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado. Verifica el ID del OpCenter.');
    return;
  }
  
  // 3. Obtener equipos del cliente
  const equipos = cliente.equipos || [];

  // 4. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 5. Generar el HTML de la sección de conectividad
  const htmlConectividad = generarConectividad(equipos, periodo);
  
  // 6. Crear HTML completo con estilos CSS inline
  const htmlCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Preview - Conectividad y Mantenimiento</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }
        
        .page {
          background: white;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 3px solid #367c2b;
        }
        
        .section-header h2 {
          font-size: 24px;
          color: #1a202c;
          font-weight: 700;
        }
        
        .btn-volver {
          color: #4299e1;
          text-decoration: none;
          font-size: 14px;
          padding: 8px 16px;
          border: 1px solid #4299e1;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .btn-volver:hover {
          background: #4299e1;
          color: white;
        }
        
        /* Gauges */
        .kpi-gauges {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .gauge-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        
        .gauge-title {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 15px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .gauge-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 10px;
          text-transform: uppercase;
        }
        
        .badge-success {
          background: #c6f6d5;
          color: #22543d;
        }
        
        .badge-warning {
          background: #feebc8;
          color: #7c2d12;
        }
        
        .badge-critical {
          background: #fed7d7;
          color: #742a2a;
        }
        
        /* Periodo */
        .periodo-text {
          text-align: center;
          font-size: 14px;
          color: #718096;
          margin-bottom: 40px;
          padding: 12px;
          background: #edf2f7;
          border-radius: 6px;
        }
        
        /* Tablas */
        .table-section {
          margin-bottom: 40px;
        }
        
        .table-title {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .table-subtitle {
          font-size: 13px;
          color: #718096;
          margin-bottom: 15px;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .data-table thead {
          background: #2d3748;
          color: white;
        }
        
        .data-table th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .data-table tbody tr {
          border-bottom: 1px solid #e2e8f0;
        }
        
        .data-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .data-table tbody tr:hover {
          background: #edf2f7;
        }
        
        .data-table td {
          padding: 12px 10px;
          color: #4a5568;
        }
        
        /* Info banner */
        .info-banner {
          background: #bee3f8;
          border-left: 4px solid #3182ce;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .info-banner strong {
          color: #2c5282;
        }
      </style>
    </head>
    <body>
      <div class="info-banner">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social} | Total Equipos: ${equipos.length}
      </div>
      
      ${htmlConectividad}
      
    </body>
    </html>
  `;
  
  // 7. Crear el output HTML y mostrarlo en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);
  
  // 8. Mostrar en el navegador
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '🔧 Preview - Conectividad y Mantenimiento'
  );
}


/**
 * Función de prueba para previsualizar la sección de Utilización
 * Muestra en el navegador cómo se verá la sección con datos reales
 */

function previsualizarUtilizacion() {
  // 1. Obtener el modelo completo con métricas calculadas
  const modelo = generarModeloConMetricas();
  
  // 2. Seleccionar un cliente (cambia el ID según necesites)
  const cliente = modelo.relaciones.clientes_por_opcenter["483165"];
  
  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado. Verifica el ID del OpCenter.');
    return;
  }
  
  // 3. Obtener equipos y métricas del cliente
  const equipos = cliente.equipos || [];
  const metricas = cliente.metricas || {};

  // 4. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 5. Generar el HTML de la sección de utilización
  const htmlUtilizacion = generarUtilizacion(equipos, metricas, periodo, modelo.config.precio_galon);  // ✅ Desde CONFIG
  
  // 6. Crear HTML completo con estilos CSS inline
  const htmlCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Preview - Utilización y Ralentí</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #1a202c;
        }
        
        .page {
          background: white;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        /* Header */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #367c2b;
        }
        
        .section-header h2 {
          font-size: 24px;
          color: #1a202c;
          font-weight: 700;
        }
        
        .btn-volver {
          color: #4299e1;
          text-decoration: none;
          font-size: 14px;
          padding: 8px 16px;
          border: 1px solid #4299e1;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .btn-volver:hover {
          background: #4299e1;
          color: white;
        }

        /* Educational Box */
        .educational-box {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
        }

        .educational-title {
          font-size: 16px;
          color: #2d3748;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .educational-text {
          font-size: 14px;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        /* Alert Box Yellow */
        .alert-box-yellow {
          background: #fffbeb;
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          display: flex;
          gap: 15px;
        }

        .alert-icon-yellow {
          font-size: 32px;
          flex-shrink: 0;
        }

        .alert-content {
          flex: 1;
        }

        .alert-title-yellow {
          font-size: 15px;
          color: #92400e;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .alert-text {
          font-size: 13px;
          color: #78350f;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .alert-emphasis {
          font-size: 13px;
          color: #92400e;
          font-style: italic;
          margin-top: 10px;
        }

        /* Info grid compact */
        .info-grid-compact {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          border-bottom: 1px solid #e2e8f0;
          align-items: center;
        }

        .info-row.highlight {
          background: #fff3cd;
          border-radius: 4px;
          border-bottom: none;
          font-weight: 600;
        }

        .info-row.warning {
          color: #c53030;
          font-weight: 600;
        }

        .info-row.economic {
          background: #f0fdf4;
          border-radius: 4px;
          border-bottom: none;
        }

        .info-value-big {
          font-weight: 700;
          color: #166534;
          font-size: 18px;
        }
        
        /* Periodo */
        .periodo-text {
          text-align: center;
          font-size: 14px;
          color: #718096;
          margin-bottom: 30px;
          padding: 12px;
          background: #edf2f7;
          border-radius: 6px;
        }
        
        /* Info Box */
        .info-box {
          background: #f0f7f4;
          border: 2px solid #367c2b;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 40px;
        }
        
        .info-box-title {
          font-size: 18px;
          color: #1a202c;
          margin-bottom: 20px;
          font-weight: 700;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .info-item.highlight {
          background: #fff3cd;
          padding: 12px;
          border-radius: 4px;
          border-bottom: none;
          font-weight: 600;
        }
        
        .info-item.warning {
          color: #c53030;
          font-weight: 600;
        }
        
        .info-label {
          color: #4a5568;
          font-size: 14px;
        }
        
        .info-value {
          font-weight: 600;
          color: #1a202c;
          font-size: 14px;
        }
        
        .info-divider {
          height: 1px;
          background: #cbd5e0;
          margin: 15px 0;
        }
        
        /* Economic Impact */
        .economic-impact {
          background: #fff9e6;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          border-radius: 4px;
          margin-top: 20px;
        }
        
        .economic-title {
          font-size: 16px;
          color: #92400e;
          margin-bottom: 15px;
          font-weight: 700;
        }
        
        .economic-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        
        .economic-item {
          text-align: center;
        }
        
        .economic-label {
          display: block;
          font-size: 12px;
          color: #78350f;
          margin-bottom: 5px;
        }
        
        .economic-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #92400e;
        }
        
        .economic-value.highlight {
          font-size: 20px;
          color: #c2410c;
        }
        
        .economic-value.highlight-big {
          font-size: 24px;
          color: #c2410c;
        }
        
        /* Tablas */
        .table-section {
          margin-bottom: 40px;
        }
        
        .table-title {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .table-subtitle {
          font-size: 13px;
          color: #718096;
          margin-bottom: 15px;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .data-table thead {
          background: #2d3748;
          color: white;
        }
        
        .data-table th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .data-table tbody tr {
          border-bottom: 1px solid #e2e8f0;
        }
        
        .data-table tbody tr:hover {
          background: #edf2f7;
        }
        
        .data-table td {
          padding: 12px 10px;
          color: #4a5568;
        }
        .data-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }

        .data-table tbody tr:nth-child(odd) {
          background: white;
        }

        .data-table tbody tr:hover {
          background: #edf2f7;
        }
        
        
        /* Table footer */
        .table-footer {
          background: #f7fafc !important;
          font-weight: 700;
        }
        
        .table-footer td {
          border-top: 2px solid #2d3748 !important;
          padding: 15px 10px !important;
        }
        
        /* Table summary */
        .table-summary {
          text-align: center;
          padding: 15px;
          background: #edf2f7;
          border-radius: 6px;
          margin-top: 15px;
          font-size: 14px;
          color: #2d3748;
        }
        
        /* Info banner */
        .info-banner {
          background: #bee3f8;
          border-left: 4px solid #3182ce;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .info-banner strong {
          color: #2c5282;
        }
      </style>
    </head>
    <body>
      <div class="info-banner">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social} | 
        Total Equipos: ${equipos.length} | 
        Operativos: ${metricas.totales?.equiposTrabajando || 0} | 
        Con exceso: ${metricas.totales?.equiposExcesoRalenti || 0}
      </div>
      
      ${htmlUtilizacion}
      
    </body>
    </html>
  `;
  
  // 7. Crear el output HTML y mostrarlo en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);
  
  // 8. Mostrar en el navegador
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '📊 Preview - Utilización y Ralentí'
  );
}

/**
 * Función de prueba para previsualizar la sección de DTC
 */
function previsualizarDTC() {
  // 1. Obtener el modelo completo
  const modelo = generarModeloConMetricas();
  
  // 2. Seleccionar un cliente
  const cliente = modelo.relaciones.clientes_por_opcenter["435028"]; // Cliente con DTCs
  
  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado.');
    return;
  }
  
  // 3. Obtener equipos y métricas
  const equipos = cliente.equipos || [];
  const metricas = cliente.metricas || {};

  // 4. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 5. Generar HTML de DTC
  const htmlDTC = generarDTC(equipos, metricas, periodo);


  
  // 6. Crear HTML completo con estilos
  const htmlCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Preview - Códigos DTC</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #1a202c;
        }
        
        .page {
          background: white;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        /* Recuadro informativo educativo */
        .dtc-info-box {
          background: #f0f7ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 25px;
          margin: 30px 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .dtc-info-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .dtc-info-title {
          font-size: 16px;
          color: #1e40af;
          font-weight: 700;
          margin-bottom: 15px;
          line-height: 1.4;
        }

        .dtc-info-text {
          font-size: 14px;
          color: #374151;
          line-height: 1.7;
          margin: 0;
        }

        /* Estado positivo */
        .dtc-status-positive {
          background: #ffffff;
          border: 2px solid #10b981;
          border-radius: 8px;
          padding: 40px 30px;
          margin: 20px 0;
          text-align: center;
        }

        .status-icon-large {
          width: 80px;
          height: 80px;
          background: #10b981;
          color: white;
          font-size: 48px;
          font-weight: 700;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
        }

        .status-title {
          font-size: 22px;
          color: #065f46;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .status-message {
          font-size: 16px;
          color: #047857;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .status-description {
          font-size: 14px;
          color: #374151;
          margin-bottom: 15px;
        }

        .status-benefits {
          list-style: none;
          padding: 0;
          margin: 20px 0;
          text-align: left;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .status-benefits li {
          font-size: 14px;
          color: #374151;
          padding: 10px 15px;
          margin-bottom: 8px;
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          border-radius: 4px;
        }

        .status-benefits li::before {
          content: "✓";
          color: #10b981;
          font-weight: 700;
          margin-right: 10px;
        }

        .status-recommendation {
          font-size: 14px;
          color: #374151;
          margin-top: 20px;
          padding: 15px;
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 4px;
          text-align: left;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .status-recommendation strong {
          color: #92400e;
        }
        
        
        /* AGREGAR AQUÍ TODOS LOS ESTILOS CSS DE ARRIBA */

        /* Resumen Box */
        .resumen-box {
          background: #f0f7f4;
          border: 2px solid #367c2b;
          border-radius: 8px;
          padding: 25px;
          margin: 20px 0 30px 0;
        }

        .resumen-title {
          font-size: 18px;
          color: #1a202c;
          margin-bottom: 20px;
          font-weight: 700;
        }
        
        .resumen-box-mejorado {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 30px;
          margin: 25px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .resumen-header {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 3px solid #367c2b;
        }

        .resumen-title-mejorado {
          font-size: 18px;
          color: #1a202c;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px 15px;
          text-align: center;
        }

        .stat-card.highlight {
          background: #fff5e6;
          border: 2px solid #f59e0b;
        }

        .stat-label {
          font-size: 11px;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          font-weight: 600;
        }

        .stat-value-big {
          font-size: 32px;
          color: #1a202c;
          font-weight: 700;
          line-height: 1;
        }

        .stat-percent {
          font-size: 18px;
          color: #4a5568;
          font-weight: 600;
        }

        .resumen-divider-mejorado {
          height: 2px;
          background: linear-gradient(to right, #e2e8f0, #cbd5e0, #e2e8f0);
          margin: 25px 0;
        }

        /* Sección Familias */
        .seccion-familias {
          margin: 20px 0;
        }

        .seccion-title {
          font-size: 13px;
          color: #2d3748;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 15px;
        }

        .familias-grafico {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Barras Apiladas por Familia */
        .familia-row-visual {
          display: flex;
          gap: 20px;
          align-items: center;
          padding: 15px;
          background: #f7fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .familia-info {
          min-width: 180px;
        }

        .familia-nombre-visual {
          font-size: 13px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 4px;
        }

        .familia-numeros {
          font-size: 11px;
          color: #718096;
          font-weight: 500;
        }

        .familia-barra-visual {
          flex: 1;
        }

        .barra-container-visual {
          display: flex;
          height: 36px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 6px;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .barra-segmento {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 700;
          min-width: 40px;
          transition: all 0.3s ease;
        }

        .barra-segmento:hover {
          opacity: 0.85;
        }

        .barra-segmento.critico {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .barra-segmento.atencion {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .barra-leyenda {
          display: flex;
          gap: 15px;
          font-size: 11px;
          padding-left: 5px;
        }

        .leyenda-critico {
          color: #c53030;
          font-weight: 600;
        }

        .leyenda-critico::before {
          content: "●";
          margin-right: 4px;
        }

        .leyenda-atencion {
          color: #d69e2e;
          font-weight: 600;
        }

        .leyenda-atencion::before {
          content: "●";
          margin-right: 4px;
        }

        /* Sección Prioridad */
        .seccion-prioridad {
          margin: 20px 0;
        }

        .prioridad-item {
          margin-bottom: 20px;
        }

        .prioridad-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .prioridad-label {
          font-size: 13px;
          font-weight: 700;
        }

        .prioridad-label.critico {
          color: #c53030;
        }

        .prioridad-label.atencion {
          color: #d69e2e;
        }

        .prioridad-value {
          font-size: 12px;
          color: #4a5568;
          font-weight: 600;
        }

        .prioridad-bar-container {
          width: 100%;
          height: 24px;
          background: #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        }

        .prioridad-bar {
          height: 100%;
          transition: width 0.3s ease;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
        }

        .prioridad-bar.critico {
          background: linear-gradient(to right, #ef4444, #dc2626);
        }

        .prioridad-bar.atencion {
          background: linear-gradient(to right, #fbbf24, #f59e0b);
        }
        .resumen-subtitle {
          font-size: 14px;
          color: #2d3748;
          margin: 15px 0 10px 0;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .resumen-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .stat-label {
          color: #4a5568;
          font-size: 14px;
        }

        .stat-value {
          font-weight: 700;
          color: #1a202c;
          font-size: 14px;
        }

        .resumen-divider {
          height: 1px;
          background: #cbd5e0;
          margin: 15px 0;
        }

        /* Familias */
        .familias-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .familia-row {
          padding: 10px;
          background: white;
          border-radius: 4px;
          border-left: 3px solid #367c2b;
        }

        .familia-nombre {
          display: block;
          font-weight: 700;
          color: #2d3748;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .familia-stats {
          display: flex;
          gap: 15px;
          font-size: 12px;
        }

        .familia-equipos {
          color: #4a5568;
        }

        .familia-criticos {
          color: #c53030;
          font-weight: 600;
        }

        .familia-atencion {
          color: #d69e2e;
          font-weight: 600;
        }

        /* Severidad Stats */
        .severidad-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .severidad-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          border-radius: 4px;
        }

        .severidad-row.critico {
          background: #fed7d7;
          border-left: 4px solid #c53030;
        }

        .severidad-row.atencion {
          background: #feebc8;
          border-left: 4px solid #d69e2e;
        }

        .severidad-label {
          font-size: 13px;
          font-weight: 600;
        }

        .severidad-value {
          font-size: 13px;
          font-weight: 700;
        }

        /* Section Headers */
        .dtc-section-header {
          margin: 30px 0 15px 0;
        }

        .dtc-section-title {
          font-size: 16px;
          color: #2d3748;
          font-weight: 700;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }

        /* Tarjetas de Equipos */
        .dtc-card-critico,
        .dtc-card-atencion {
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }

        .dtc-card-critico {
          border: 2px solid #dc2626;
          background: #fee2e2;
        }

        .dtc-card-atencion {
          border: 2px solid #f59e0b;
          background: #fef3c7;
        }

        .dtc-card-header {
          margin-bottom: 15px;
        }

        .dtc-card-title {
          font-size: 16px;
          color: #1a202c;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .dtc-card-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .dtc-card-serie {
          color: #4a5568;
        }

        .dtc-card-count {
          color: #2d3748;
          font-weight: 600;
        }

        /* Subsección */
        .dtc-subsection {
          margin: 20px 0 10px 0;
        }

        .dtc-subsection-title {
          font-size: 13px;
          color: #2d3748;
          font-weight: 700;
          margin-bottom: 10px;
        }

        /* Tabla de DTCs */
        .dtc-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin: 10px 0;
          background: white;
        }

        .dtc-table thead {
          background: #2d3748;
          color: white;
        }

        .dtc-table th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dtc-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #e2e8f0;
          color: #4a5568;
        }

        .dtc-table tbody tr:hover {
          background: #f7fafc;
        }

        /* Códigos adicionales */
        .dtc-additional {
          text-align: center;
          padding: 12px;
          background: white;
          border-radius: 4px;
          margin-top: 10px;
          font-size: 12px;
          color: #718096;
          font-style: italic;
        }

        /* Mensaje sin DTCs */
        .no-dtc-message {
          text-align: center;
          padding: 60px 40px;
          background: #d1fae5;
          border: 2px solid #10b981;
          border-radius: 8px;
          margin: 30px 0;
        }

        .no-dtc-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .no-dtc-title {
          font-size: 24px;
          color: #065f46;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .no-dtc-text {
          font-size: 16px;
          color: #047857;
          line-height: 1.6;
          margin-bottom: 10px;
        }
        
      </style>
    </head>
    <body>
      <div class="info-banner" style="background: #bee3f8; border-left: 4px solid #3182ce; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social} | 
        Equipos con DTC: ${equipos.filter(e => e.dtc && e.dtc.length > 0).length}
      </div>
      
      ${htmlDTC}
      
    </body>
    </html>
  `;
  
  // 7. Mostrar en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);
  
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '📊 Preview - Códigos DTC'
  );
}

// PRUEBA ACEITE
/**
 * Previsualizar sección de Análisis de Fluidos
 */
function previsualizarAnalisisFluidos() {
  // 1. Obtener modelo completo
  const modelo = generarModeloConMetricas();
  
  // 2. Seleccionar cliente con análisis
  const cliente = modelo.relaciones.clientes_por_opcenter["615805"]; // Cliente con análisis
  
  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado.');
    return;
  }
  
  // 3. Obtener equipos
  const equipos = cliente.equipos || [];

  // 4. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 5. Obtener imagen ALS (si existe)
  const imagenBase64 = getBase64ImageFromDrive("1_W2fwyNLTHPSUUx6g6b3u2x6UnPESiVS");
  
  // 6. Generar HTML de Análisis de Fluidos
  const htmlFluidos = generarAnalisisFluidos(equipos, periodo, imagenBase64);
  
  // 7. Crear HTML completo con estilos
  const htmlCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Preview - Análisis de Fluidos</title>
      <style>

      /* Mensaje simple sin análisis */
      .fluidos-mensaje-simple {
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 30px 40px;
        margin: 30px 0;
        text-align: justify;
      }

      .mensaje-principal {
        font-size: 15px;
        color: #212121;
        font-weight: 700;
        margin-bottom: 20px;
        line-height: 1.6;
      }

      .mensaje-secundario {
        font-size: 14px;
        color: #424242;
        margin-bottom: 15px;
        line-height: 1.7;
      }

      .mensaje-secundario strong {
        color: #000000;
        font-weight: 700;
      }

      .mensaje-cierre {
        font-size: 14px;
        color: #424242;
        margin: 0;
        line-height: 1.7;
      }

      .mensaje-cierre strong {
        color: #000000;
        font-weight: 700;
      }

      /* Imagen grande (80% ancho) */
      .fluidos-imagen-container {
        text-align: center;
        margin: 40px 0

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #212121;
        }
        
        .page {
          background: white;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #367c2b;
        }
        
        .section-header h2 {
          font-size: 24px;
          color: #1a202c;
        }
        
        .btn-volver {
          background: #367c2b;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          font-size: 12px;
        }
        
        .periodo-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }
        
        /* AGREGAR AQUÍ TODOS LOS ESTILOS CSS DE ARRIBA */
        /* ============================================
          ANÁLISIS DE FLUIDOS - ESTILOS
          ============================================ */

        /* Info Box (sin datos) */
        .fluidos-info-box {
          background: #e3f2fd;
          border: 2px solid #2196f3;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }

        .fluidos-info-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .fluidos-info-title {
          font-size: 16px;
          color: #1565c0;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .fluidos-info-text {
          font-size: 14px;
          color: #424242;
          line-height: 1.6;
        }

        /* Promo Box */
        .fluidos-promo-box {
          background: #f5f5f5;
          border: 2px solid #9e9e9e;
          border-radius: 8px;
          padding: 25px;
          margin: 20px 0;
        }

        .promo-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .promo-title {
          font-size: 16px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .promo-text {
          font-size: 14px;
          color: #616161;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .promo-subtitle {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .promo-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .promo-benefits li {
          padding: 8px 0 8px 25px;
          position: relative;
          font-size: 13px;
          color: #616161;
        }

        .promo-benefits li::before {
          content: "•";
          position: absolute;
          left: 10px;
          color: #2196f3;
          font-weight: 700;
        }

        /* Imagen */
        .fluidos-imagen-container {
          text-align: center;
          margin: 30px 0;
        }

        .fluidos-imagen-grande {
          max-width: 80%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* Resumen Box */
        .fluidos-resumen-box {
          background: #ffffff;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 25px;
          margin: 20px 0;
        }

        .fluidos-resumen-title {
          font-size: 16px;
          color: #212121;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .fluidos-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .fluidos-stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .fluidos-divider {
          height: 2px;
          background: linear-gradient(to right, #e0e0e0, #bdbdbd, #e0e0e0);
          margin: 15px 0;
        }

        .fluidos-subtitle {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .fluidos-resultados {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .resultado-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          border-radius: 4px;
        }

        .resultado-row.anormal {
          background: #ffebee;
          border-left: 4px solid #d32f2f;
        }

        .resultado-row.precaucion {
          background: #fff3e0;
          border-left: 4px solid #f57c00;
        }

        .resultado-row.normal {
          background: #e8f5e9;
          border-left: 4px solid #388e3c;
        }

        .resultado-label {
          font-size: 13px;
          font-weight: 600;
        }

        .resultado-value {
          font-size: 13px;
          font-weight: 700;
        }

        /* Leyenda Box */
        .fluidos-leyenda-box {
          background: #fafafa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px 20px;
          margin: 15px 0;
        }

        .leyenda-title {
          font-size: 12px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .leyenda-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          font-size: 12px;
          color: #616161;
        }

        .leyenda-icono {
          font-size: 14px;
        }

        /* Section Headers */
        .fluidos-section-header {
          margin: 30px 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }

        .fluidos-section-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .fluidos-section-subtitle {
          font-size: 12px;
          color: #757575;
          font-style: italic;
        }

        /* Tarjetas Anormales */
        .fluidos-card-anormal {
          background: #ffebee;
          border: 3px solid #d32f2f;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }

        .fluidos-card-equipo {
          font-size: 14px;
          color: #c62828;
          font-weight: 700;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ef9a9a;
        }

        .fluidos-card-content {
          margin-bottom: 15px;
        }

        .fluidos-card-row {
          display: flex;
          gap: 10px;
          padding: 6px 0;
          font-size: 13px;
        }

        .card-label {
          font-weight: 600;
          color: #424242;
          min-width: 120px;
        }

        .card-value {
          color: #616161;
        }

        .fluidos-card-link {
          text-align: center;
          padding-top: 10px;
        }

        .btn-informe {
          display: inline-block;
          background: #d32f2f;
          color: white;
          padding: 10px 30px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 600;
          font-size: 12px;
          transition: background 0.3s;
        }

        .btn-informe:hover {
          background: #b71c1c;
        }

        /* Grupo Equipo (Precaución) */
        .fluidos-grupo-equipo {
          margin: 20px 0;
        }

        .fluidos-grupo-titulo {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 10px;
          padding: 10px;
          background: #fff3e0;
          border-left: 4px solid #f57c00;
          border-radius: 4px;
        }

        .fluidos-tabla {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          background: white;
          margin-bottom: 15px;
        }

        .fluidos-tabla thead {
          background: #424242;
          color: white;
        }

        .fluidos-tabla th {
          padding: 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
        }

        .fluidos-tabla td {
          padding: 10px;
          border-bottom: 1px solid #eeeeee;
          color: #616161;
        }

        .fluidos-tabla tbody tr:hover {
          background: #fafafa;
        }

        /* Lista Equipo (Normal) */
        .fluidos-lista-equipo {
          margin: 15px 0;
        }

        .fluidos-lista-titulo {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .fluidos-lista {
          list-style: none;
          padding: 0;
          margin: 0 0 0 15px;
        }

        .fluidos-lista li {
          padding: 6px 0;
          font-size: 12px;
          color: #616161;
        }

        .link-ver {
          color: #1976d2;
          text-decoration: none;
          font-weight: 600;
        }

        .link-ver:hover {
          text-decoration: underline;
        }

        /* ============================================
        ANÁLISIS DE FLUIDOS - ESTILOS ACTUALIZADOS
        ============================================ */

        /* Resumen Box */
        .fluidos-resumen-box {
          background: #ffffff;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }

        .fluidos-resumen-title {
          font-size: 16px;
          color: #212121;
          font-weight: 700;
          margin-bottom: 15px;
        }

        .fluidos-stats {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }

        .fluidos-stat-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .stat-label {
          font-size: 13px;
          color: #616161;
        }

        .stat-value {
          font-size: 13px;
          font-weight: 700;
          color: #212121;
        }

        .fluidos-divider {
          height: 2px;
          background: linear-gradient(to right, #e0e0e0, #bdbdbd, #e0e0e0);
          margin: 20px 0;
        }

        .fluidos-subtitle {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 15px;
          text-transform: uppercase;
        }

        /* Resultados con barras */
        .fluidos-resultados {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .resultado-item {
          margin-bottom: 5px;
        }

        .resultado-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .resultado-label {
          font-size: 13px;
          font-weight: 600;
          color: #424242;
        }

        .resultado-value {
          font-size: 13px;
          font-weight: 700;
          color: #212121;
        }

        .resultado-barra-container {
          width: 100%;
          height: 22px;
          background: #f5f5f5;
          border-radius: 11px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
          border: 1px solid #e0e0e0;
        }

        .resultado-barra {
          height: 100%;
          transition: width 0.4s ease;
          position: relative;
        }

        .resultado-barra.anormal {
          background: linear-gradient(to right, #ef5350, #d32f2f);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .resultado-barra.precaucion {
          background: linear-gradient(to right, #ffa726, #f57c00);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }

        .resultado-barra.normal {
          background: linear-gradient(to right, #66bb6a, #388e3c);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
        }

        /* Leyenda Box */
        .fluidos-leyenda-box {
          background: #fafafa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px 20px;
          margin: 20px 0;
        }

        .leyenda-title {
          font-size: 12px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .leyenda-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          font-size: 12px;
          color: #616161;
        }

        .leyenda-icono {
          font-size: 14px;
        }

        /* Section Headers */
        .fluidos-section-header {
          margin: 35px 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }

        .fluidos-section-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 5px;
          color: #212121;
        }

        .fluidos-section-subtitle {
          font-size: 12px;
          color: #757575;
          font-style: italic;
          margin: 0;
        }

        /* Tarjetas Anormales */
        .fluidos-card-anormal {
          background: #ffebee;
          border: 3px solid #d32f2f;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          box-shadow: 0 2px 4px rgba(211, 47, 47, 0.1);
        }

        .fluidos-card-equipo {
          font-size: 14px;
          color: #c62828;
          font-weight: 700;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ef9a9a;
        }

        .fluidos-card-content {
          margin-bottom: 15px;
        }

        .fluidos-card-row {
          display: flex;
          gap: 10px;
          padding: 6px 0;
          font-size: 13px;
        }

        .card-label {
          font-weight: 600;
          color: #424242;
          min-width: 120px;
        }

        .card-value {
          color: #616161;
        }

        .fluidos-card-link {
          text-align: center;
          padding-top: 10px;
        }

        .btn-informe {
          display: inline-block;
          background: #d32f2f;
          color: white;
          padding: 10px 30px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 600;
          font-size: 12px;
          transition: background 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .btn-informe:hover {
          background: #b71c1c;
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }

        /* Grupo Equipo (Precaución) */
        .fluidos-grupo-equipo {
          margin: 20px 0;
        }

        .fluidos-grupo-titulo {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 10px;
          padding: 12px 15px;
          background: #fff3e0;
          border-left: 4px solid #f57c00;
          border-radius: 4px;
        }

        .fluidos-tabla {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          background: white;
          margin-bottom: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .fluidos-tabla thead {
          background: #424242;
          color: white;
        }

        .fluidos-tabla th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .fluidos-tabla td {
          padding: 12px 10px;
          border-bottom: 1px solid #f5f5f5;
          color: #616161;
        }

        .fluidos-tabla tbody tr:last-child td {
          border-bottom: none;
        }

        .fluidos-tabla tbody tr:hover {
          background: #fafafa;
        }

        /* Lista Equipo (Normal) - MEJORADA */
        .fluidos-lista-equipo {
          margin: 20px 0;
        }

        .fluidos-lista-titulo {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 12px;
          padding: 10px 15px;
          background: #f1f8e9;
          border-left: 4px solid #689f38;
          border-radius: 4px;
        }

        .fluidos-lista-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }

        .fluidos-lista-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          background: #f9f9f9;
          border-radius: 4px;
          border-left: 3px solid #66bb6a;
          transition: background 0.2s;
        }

        .fluidos-lista-item:hover {
          background: #f1f8e9;
        }

        .lista-bullet {
          color: #66bb6a;
          font-size: 16px;
          font-weight: 700;
          line-height: 1;
        }

        .lista-compartimiento {
          flex: 1;
          font-size: 12px;
          color: #424242;
          line-height: 1.4;
        }

        .lista-muestra {
          font-size: 11px;
          color: #757575;
          font-weight: 600;
          white-space: nowrap;
        }

        .lista-link {
          color: #1976d2;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 14px;
          background: #e3f2fd;
          border-radius: 3px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .lista-link:hover {
          background: #1976d2;
          color: white;
          box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
        }

        /* Links generales */
        .link-ver {
          color: #1976d2;
          text-decoration: none;
          font-weight: 600;
          font-size: 11px;
          padding: 4px 10px;
          background: #e3f2fd;
          border-radius: 3px;
          transition: all 0.2s;
          display: inline-block;
        }

        .link-ver:hover {
          background: #1976d2;
          color: white;
          box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
        }

        /* Info Box (sin datos) */
        .fluidos-info-box {
          background: #e3f2fd;
          border: 2px solid #2196f3;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }

        .fluidos-info-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .fluidos-info-title {
          font-size: 16px;
          color: #1565c0;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .fluidos-info-text {
          font-size: 14px;
          color: #424242;
          line-height: 1.6;
        }

        /* Promo Box */
        .fluidos-promo-box {
          background: #f5f5f5;
          border: 2px solid #9e9e9e;
          border-radius: 8px;
          padding: 25px;
          margin: 20px 0;
        }

        .promo-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }

        .promo-title {
          font-size: 16px;
          color: #424242;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .promo-text {
          font-size: 14px;
          color: #616161;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .promo-subtitle {
          font-size: 13px;
          color: #424242;
          font-weight: 700;
          margin: 15px 0 10px 0;
          text-transform: uppercase;
        }

        .promo-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .promo-benefits li {
          padding: 8px 0 8px 25px;
          position: relative;
          font-size: 13px;
          color: #616161;
        }

        .promo-benefits li::before {
          content: "•";
          position: absolute;
          left: 10px;
          color: #2196f3;
          font-weight: 700;
          font-size: 16px;
        }

        /* Imagen */
        .fluidos-imagen-container {
          text-align: center;
          margin: 30px 0;
        }

        .fluidos-imagen {
          max-width: 65%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <div class="info-banner" style="background: #bee3f8; border-left: 4px solid #3182ce; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social} | 
        Equipos con análisis: ${equipos.filter(e => e.ac && e.ac.length > 0).length}
      </div>
      
      ${htmlFluidos}
      
    </body>
    </html>
  `;
  
  // 8. Mostrar en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);
  
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '📊 Preview - Análisis de Fluidos'
  );
}

// PRUEBA EXPERT ALERT 
/**
 * Función de prueba para previsualizar la sección de Expert Alerts
 * Muestra en el navegador cómo se verá la sección con datos reales
 */
function previsualizarEventosAlerta() {
  
  // 1. Obtener modelo completo
  const modelo = generarModeloConMetricas();
  
  // 2. Seleccionar cliente con Expert Alerts
  // Cambia este ID por un cliente que tenga datos en 'ea'
  const cliente = modelo.relaciones.clientes_por_opcenter["7499"]; 
  
  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado.');
    return;
  }
  
  // 3. Obtener equipos
  const equipos = cliente.equipos || [];
  
  // 4. Verificar si hay alertas
  const equiposConAlertas = equipos.filter(eq => eq.ea && eq.ea.length > 0);
  
  if (equiposConAlertas.length === 0) {
    Logger.log('⚠️ Este cliente no tiene Expert Alerts. Mostrando mensaje sin alertas.');
  } else {
    Logger.log(`✅ Cliente tiene ${equiposConAlertas.length} equipos con alertas.`);
  }

  // 5. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 6. Generar HTML de Expert Alerts
  const htmlEA = generarEventosAlerta(equipos, periodo);
  
  // 7. Crear HTML completo con estilos
  const htmlCompleto = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
        }
        
        .info-banner {
          background: #bee3f8;
          border-left: 4px solid #3182ce;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .page {
          background: white;
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Header de sección */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #f57c00;
        }
        
        .section-header h2 {
          margin: 0;
          color: #f57c00;
          font-size: 24px;
          font-weight: 700;
        }
        
        .btn-volver {
          color: #3182ce;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }
        
        .periodo-text {
          font-size: 13px;
          color: #666;
          margin-bottom: 25px;
        }
        
        /* Recuadro educativo */
        .ea-info-box {
          background: #fff3e0;
          border-left: 4px solid #f57c00;
          padding: 25px 30px;
          margin-bottom: 30px;
          border-radius: 4px;
        }
        
        .ea-info-title {
          margin: 0 0 15px 0;
          color: #e65100;
          font-size: 16px;
          font-weight: 700;
        }
        
        .ea-info-text {
          margin: 0;
          color: #424242;
          font-size: 14px;
          line-height: 1.7;
          text-align: justify;
        }
        
        /* Resumen ejecutivo */
        .ea-resumen {
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
        }
        
        .ea-resumen-titulo {
          margin: 0 0 25px 0;
          color: #212121;
          font-size: 18px;
          font-weight: 700;
          text-align: center;
        }
        
        /* Barras de progreso */
        .ea-barras-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .ea-barra-grupo {
          text-align: center;
        }
        
        .ea-barra-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .ea-barra-label {
          font-size: 11px;
          font-weight: 700;
          color: #616161;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .ea-barra-valor {
          font-size: 24px;
          font-weight: 700;
        }
        
        .ea-barra-bg {
          background: #e0e0e0;
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 5px;
        }
        
        .ea-barra-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.3s ease;
        }
        
        .ea-barra-fill.critica {
          background: linear-gradient(90deg, #d32f2f 0%, #f44336 100%);
        }
        
        .ea-barra-fill.alta {
          background: linear-gradient(90deg, #f57c00 0%, #ff9800 100%);
        }
        
        .ea-barra-fill.rendimiento {
          background: linear-gradient(90deg, #fbc02d 0%, #ffeb3b 100%);
        }
        
        .ea-barra-pct {
          font-size: 12px;
          color: #757575;
          font-weight: 600;
        }
        
        /* Leyenda */
        .ea-leyenda {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .leyenda-titulo {
          margin: 0 0 15px 0;
          font-size: 14px;
          font-weight: 700;
          color: #212121;
        }
        
        .leyenda-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          font-size: 13px;
          line-height: 1.6;
        }
        
        .leyenda-item:last-child {
          margin-bottom: 0;
        }
        
        .leyenda-icon {
          font-size: 16px;
          margin-right: 10px;
          flex-shrink: 0;
        }
        
        .leyenda-text {
          color: #424242;
        }
        
        .leyenda-text strong {
          color: #212121;
        }
        
        /* Estadísticas */
        .ea-stats {
          margin-top: 20px;
        }
        
        .ea-stat-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .stat-bullet {
          margin-right: 10px;
          color: #f57c00;
          font-weight: 700;
        }
        
        .stat-text {
          color: #424242;
        }
        
        .stat-text strong {
          color: #212121;
          font-weight: 700;
        }
        
        /* Secciones de alertas */
        .ea-section-header {
          margin: 40px 0 20px 0;
        }
        
        .ea-section-title {
          margin: 0;
          padding: 15px 20px;
          background: linear-gradient(135deg, #424242 0%, #616161 100%);
          color: white;
          font-size: 16px;
          font-weight: 700;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Tarjeta de equipo */
        .ea-tarjeta {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .ea-tarjeta-header {
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        
        .ea-equipo-titulo {
          margin: 0;
          color: #212121;
          font-size: 16px;
          font-weight: 700;
        }
        
        /* Contador */
        .ea-contador {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          padding: 12px 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .contador-icon {
          font-size: 18px;
          margin-right: 10px;
        }
        
        .contador-text {
          font-size: 14px;
          color: #424242;
          font-weight: 600;
        }
        
        /* Lista de alertas por severidad */
        .ea-lista-seccion {
          margin-bottom: 20px;
        }
        
        .ea-lista-titulo {
          margin: 0 0 15px 0;
          color: #424242;
          font-size: 14px;
          font-weight: 700;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        /* Items de alerta */
        .ea-alerta-item {
          margin-bottom: 15px;
          padding-left: 5px;
        }
        
        .alerta-descripcion {
          font-size: 14px;
          color: #212121;
          line-height: 1.6;
          margin-bottom: 5px;
        }
        
        .alerta-meta {
          font-size: 12px;
          color: #757575;
          padding-left: 15px;
        }
        
        /* Mensaje sin alertas */
        .ea-status-positive {
          background: #e8f5e9;
          border: 2px solid #66bb6a;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin-top: 30px;
        }
        
        .status-icon-large {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .status-title {
          margin: 0 0 15px 0;
          color: #2e7d32;
          font-size: 20px;
          font-weight: 700;
        }
        
        .status-message {
          font-size: 15px;
          color: #424242;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .status-description {
          font-size: 14px;
          color: #424242;
          margin-bottom: 15px;
        }
        
        .status-benefits {
          text-align: left;
          display: inline-block;
          margin: 0;
          padding-left: 20px;
        }
        
        .status-benefits li {
          font-size: 14px;
          color: #424242;
          margin-bottom: 8px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="info-banner">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social || cliente.id_opcenter} | 
        Equipos con alertas: ${equiposConAlertas.length} de ${equipos.length}
      </div>
      
      ${htmlEA}
      
    </body>
    </html>
  `;
  
  // 8. Mostrar en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);
  
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '⚠️ Preview - Expert Alerts'
  );
}



//PRUBA ACCIONES Y RECOMENDACIONES
/**
 * Función de prueba para previsualizar Acciones y Recomendaciones
 */
function previsualizarAccionesRecomendaciones() {
  
  // 1. Obtener modelo completo
  const modelo = generarModeloConMetricas();
  
  // 2. Seleccionar cliente
  const cliente = modelo.relaciones.clientes_por_opcenter["483165"];
  
  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado.');
    return;
  }
  
  // 3. Obtener equipos
  const equipos = cliente.equipos || [];
  
  // 4. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 5. Generar HTML de Acciones
  const htmlAcciones = generarAccionesRecomendaciones(equipos, periodo);
  
  // 6. Crear HTML completo con estilos
  const htmlCompleto = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background: #f5f5f5;
        }
        
        .info-banner {
          background: #bee3f8;
          border-left: 4px solid #3182ce;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .page {
          background: white;
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        /* Header de sección */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #f57c00;
        }
        
        .section-header h2 {
          margin: 0;
          color: #f57c00;
          font-size: 24px;
          font-weight: 700;
        }
        
        .btn-volver {
          color: #3182ce;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
        }
        
        .periodo-text {
          font-size: 13px;
          color: #666;
          margin-bottom: 25px;
        }
        
        /* Secciones de prioridad */
        .acciones-section-header {
          margin: 40px 0 20px 0;
        }
        
        .acciones-section-title {
          margin: 0;
          padding: 15px 20px;
          background: linear-gradient(135deg, #424242 0%, #616161 100%);
          color: white;
          font-size: 16px;
          font-weight: 700;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Tarjeta de acción */
        .accion-tarjeta {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .accion-tarjeta-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        
        .accion-equipo-titulo {
          margin: 0;
          color: #212121;
          font-size: 16px;
          font-weight: 700;
        }
        
        .accion-equipo-serie {
          color: #757575;
          font-size: 13px;
          font-weight: 600;
        }
        
        .accion-tarjeta-body {
          margin-bottom: 15px;
        }
        
        .accion-subtitulo {
          margin: 0 0 15px 0;
          color: #424242;
          font-size: 14px;
          font-weight: 700;
        }
        
        .accion-item {
          margin-bottom: 15px;
        }
        
        .accion-descripcion {
          font-size: 14px;
          color: #212121;
          line-height: 1.6;
          margin-bottom: 5px;
        }
        
        .accion-contexto {
          font-size: 12px;
          color: #757575;
          padding-left: 25px;
        }
        
        .accion-tarjeta-footer {
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
        }
        
        .accion-asesor {
          font-size: 13px;
          color: #424242;
          font-weight: 600;
        }
        
        /* Contactos */
        .acciones-contactos {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 3px solid #e0e0e0;
        }
        
        .contactos-header {
          margin-bottom: 15px;
        }
        
        .contactos-titulo {
          margin: 0;
          color: #212121;
          font-size: 18px;
          font-weight: 700;
        }
        
        .contactos-intro {
          font-size: 14px;
          color: #424242;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        
        .contactos-tabla {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .contacto-header-row {
          background: #f5f5f5;
          border-bottom: 2px solid #e0e0e0;
        }
        
        .contacto-th {
          padding: 12px 15px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: #424242;
        }
        
        .contacto-fila {
          border-bottom: 1px solid #f0f0f0;
        }
        
        .contacto-fila:last-child {
          border-bottom: none;
        }
        
        .contacto-fila td {
          padding: 12px 15px;
          font-size: 13px;
          color: #424242;
        }
        
        .contacto-nombre {
          font-weight: 600;
          color: #212121;
        }
        
        /* Mensaje sin acciones */
        .acciones-status-positive {
          background: #e8f5e9;
          border: 2px solid #66bb6a;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin-top: 30px;
        }
        
        .status-icon-large {
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .status-title {
          margin: 0 0 15px 0;
          color: #2e7d32;
          font-size: 20px;
          font-weight: 700;
        }
        
        .status-message {
          font-size: 15px;
          color: #424242;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .status-description {
          font-size: 14px;
          color: #424242;
          margin-bottom: 15px;
        }
        
        .status-benefits {
          text-align: left;
          display: inline-block;
          margin: 0;
          padding-left: 20px;
        }
        
        .status-benefits li {
          font-size: 14px;
          color: #424242;
          margin-bottom: 8px;
          line-height: 1.6;
        }
      </style>
    </head>
    <body>
      <div class="info-banner">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social || cliente.id_opcenter}
      </div>
      
      ${htmlAcciones}
      
    </body>
    </html>
  `;

  // 7. Mostrar en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);

  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '📋 Preview - Acciones y Recomendaciones'
  );
}


// CONTACTOS
/**
 * Función de prueba para previsualizar la sección de Contactos
 * Muestra en el navegador cómo se verá la sección con datos reales
 */
function previsualizarSeccionContactos() {
  // 1. Obtener el modelo completo con métricas calculadas
  const modelo = generarModeloConMetricas();

  // 2. Seleccionar un cliente (cambia el ID según necesites)
  const cliente = modelo.relaciones.clientes_por_opcenter["7499"];

  if (!cliente) {
    SpreadsheetApp.getUi().alert('❌ Cliente no encontrado. Verifica el ID del OpCenter.');
    return;
  }

  // 3. Obtener contactos del cliente
  const contactos = cliente.contactos || [];

  // 4. Obtener periodo
  const periodo = {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  };  // ✅ Desde CONFIG

  // 5. Generar el HTML de la sección de contactos
  const htmlContactos = generarSeccionContactos(cliente, periodo);

  // 6. Crear HTML completo con estilos CSS inline
  const htmlCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Preview - Contactos</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
        }

        .page {
          background: white;
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 3px solid #367c2b;
        }

        .section-header h2 {
          font-size: 24px;
          color: #ed8936;
          font-weight: 700;
        }

        .btn-volver {
          color: #4299e1;
          text-decoration: none;
          font-size: 14px;
          padding: 8px 16px;
          border: 1px solid #4299e1;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .btn-volver:hover {
          background: #4299e1;
          color: white;
        }

        /* Periodo */
        .periodo-text {
          text-align: center;
          font-size: 14px;
          color: #718096;
          margin-bottom: 40px;
          padding: 12px;
          background: #edf2f7;
          border-radius: 6px;
        }

        /* Tablas */
        .table-section {
          margin-bottom: 40px;
        }

        .table-title {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .data-table thead {
          background: #2d3748;
          color: white;
        }

        .data-table th {
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .data-table tbody tr {
          border-bottom: 1px solid #e2e8f0;
        }

        .data-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }

        .data-table tbody tr:hover {
          background: #edf2f7;
        }

        .data-table td {
          padding: 12px 10px;
          color: #4a5568;
        }

        /* Contacto IPESA Box */
        .contacto-ipesa-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
          border-radius: 8px;
          padding: 25px;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.15);
        }

        .contacto-ipesa-title {
          font-size: 20px;
          color: #92400e;
          font-weight: 700;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .contacto-ipesa-text {
          font-size: 16px;
          color: #78350f;
          font-weight: 500;
        }

        /* Info Box Blue */
        .info-box-blue {
          background: #dbeafe;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          gap: 15px;
          margin: 30px 0;
        }

        .info-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .info-content {
          flex: 1;
        }

        .info-title {
          font-size: 16px;
          color: #1e40af;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .info-text {
          font-size: 14px;
          color: #1e3a8a;
          line-height: 1.6;
        }

        /* Info banner */
        .info-banner {
          background: #bee3f8;
          border-left: 4px solid #3182ce;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }

        .info-banner strong {
          color: #2c5282;
        }
      </style>
    </head>
    <body>
      <div class="info-banner">
        <strong>🧪 MODO PREVIEW</strong> - Cliente: ${cliente.razon_social} | Total Contactos: ${contactos.length}
      </div>

      ${htmlContactos}

    </body>
    </html>
  `;

  // 7. Crear el output HTML y mostrarlo en modal
  const htmlOutput = HtmlService.createHtmlOutput(htmlCompleto)
    .setWidth(1200)
    .setHeight(800);

  // 8. Mostrar en el navegador
  SpreadsheetApp.getUi().showModalDialog(
    htmlOutput,
    '📞 Preview - Contactos'
  );
}


/**
 * 🆕 PRUEBA: PDF con 4 páginas (Resumen + Recomendaciones + Conectividad + Utilización)
 * Proof of Concept extendido para validar patrón con sección de Utilización
 */
function probarPDF4PaginasConHtmlService(clienteId = "7499") {
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
        titulo: 'Reporte de Gestión de Flota' + " " + cliente.num_informe,
        subtitulo: 'Centro de Soluciones Conectadas — IPESA'
      }
    });

    // 3. Generar datos para RESUMEN
    const data = renderGraficosResumen(cliente.metricas);
    const recomendacionesHTML = buildRecomendaciones(cliente.metricas);

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

    //recomendaciones
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
    const jdProtectHTML = generarPaginaJohnDeereProtect(L.imagenPromoJDProtect);

    // 6. Cargar template de 4 páginas
    const htmlTemplate = HtmlService.createTemplateFromFile('reporte-flota');

    // 7. Inyectar datos al template
    htmlTemplate.portadaHTML = portadaHTML
    htmlTemplate.htmlFluidos = htmlFluidos; // 💧 Nueva sección de análisis de fluidos
    htmlTemplate.expertAlertsHTML = expertAlertsHTML;
    htmlTemplate.metricas = cliente.metricas;
    htmlTemplate.data = data;
    htmlTemplate.accionesHTML = accionesHTML;
    htmlTemplate.recomendacionesHTML = recomendacionesHTML;
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


