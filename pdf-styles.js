/**
 * ============================================================================
 * PDF STYLES - Sistema de Estilos Centralizado para Reportes de Flota
 * ============================================================================
 *
 * Este módulo centraliza TODOS los estilos CSS del reporte PDF.
 * Elimina duplicación y garantiza consistencia visual.
 *
 * Estrategia de colores:
 * - Verde IPESA (#367C2B) para branding y headers
 * - Azul (#1a365d) para contenido y datos
 * - Semáforo estándar para estados (verde/amarillo/rojo)
 *
 * @author CSC IPESA
 * @version 2.0
 */

// ============================================================================
// VARIABLES CSS GLOBALES
// ============================================================================

/* NOTA: Variables CSS eliminadas - no soportadas en Google Apps Script PDF
 * Los valores se usan directamente en los estilos
 *
 * Referencia de colores:
 * - IPESA Green: #367C2B
 * - IPESA Yellow: #F5A800
 * - IPESA Gray: #53575A
 * - Primary: #1a365d
 * - Success: #38a169
 * - Warning: #ed8936
 * - Critical: #e53e3e
 * - Info: #4299e1
 */

const CSS_VARIABLES = ``;

// ============================================================================
// ESTILOS GLOBALES BASE
// ============================================================================

const ESTILOS_GLOBALES = `
  /* Reset Universal */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Configuración de Página */
  @page {
    size: A4 landscape;
    margin: 15mm 10mm;
  }

  /* Body Base */
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 8pt;
    color: #2d3748;
    background-color: white;
    margin: 0;
    padding: 0;
  }

  /* Página Base */
  .page {
    width: 100%;
    min-height: 210mm;
    max-height: 210mm;
    page-break-after: always;
    page-break-inside: avoid;
    position: relative;
    padding: 15mm 10mm;
    box-sizing: border-box;
    overflow: hidden;
  }

  /* Número de Página */
  .page-number {
    position: absolute;
    bottom: 10px;
    right: 20px;
    font-size: 7pt;
    color: #718096;
  }

  /* Media Print */
  @media print {
    body {
      margin: 0;
      padding: 0;
    }

    .page {
      page-break-after: always;
    }
  }
`;

// ============================================================================
// ESTILOS DE LAYOUT Y ESTRUCTURA
// ============================================================================

const ESTILOS_LAYOUT = `
  /* Header Principal */
  .header {
    background: linear-gradient(135deg, #367C2B 0%, #2d6322 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 6px 6px 0 0;
    margin-bottom: 8px;
  }

  .header h1 {
    font-size: 14pt;
    font-weight: 700;
    margin: 0;
  }

  .header-subtitle {
    font-size: 7pt;
    opacity: 0.9;
    margin-top: 2px;
  }

  /* Section Header */
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg, #367C2B 0%, #2d6322 100%);
    color: white;
    border-radius: 5px;
    margin-bottom: 10px;
    font-size: 9pt;
    font-weight: 600;
  }

  .section-icon {
    font-size: 10pt;
  }

  /* Grids - Convertidos a tablas para compatibilidad PDF */
  .metrics-grid {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 6px;
    margin-bottom: 10px;
  }

  .metrics-grid-row {
    display: table-row;
  }

  .metrics-grid .kpi-item {
    display: table-cell;
    width: 25%;
    vertical-align: top;
  }

  .kpi-bar {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 5px;
    margin-bottom: 10px;
  }

  .kpi-bar-row {
    display: table-row;
  }

  .kpi-bar .kpi-item {
    display: table-cell;
    width: 12.5%;
    vertical-align: top;
  }

  .alerts-grid {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 8px;
  }

  .alerts-grid-row {
    display: table-row;
  }

  .alerts-grid .kpi-item {
    display: table-cell;
    width: 33.33%;
    vertical-align: top;
  }
`;

// ============================================================================
// COMPONENTES REUTILIZABLES
// ============================================================================

const ESTILOS_COMPONENTES = `
  /* ==================== KPI ITEMS ==================== */
  .kpi-item {
    background: white;
    border: 1.5px solid #e2e8f0;
    border-radius: 5px;
    padding: 6px 8px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .kpi-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
  }

  .kpi-item[data-type="success"]::before { background: #38a169; }
  .kpi-item[data-type="warning"]::before { background: #ed8936; }
  .kpi-item[data-type="critical"]::before { background: #e53e3e; }
  .kpi-item[data-type="info"]::before { background: #4299e1; }

  .kpi-value {
    font-size: 13pt;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 2px;
  }

  .kpi-label {
    font-size: 6pt;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* ==================== METRIC CARDS ==================== */
  .metric-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .metric-title {
    font-size: 7pt;
    color: #718096;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .metric-value {
    font-size: 16pt;
    font-weight: 700;
    color: #1a365d;
  }

  .metric-footer {
    font-size: 6pt;
    color: #718096;
    margin-top: 4px;
  }

  /* ==================== GAUGES / MEDIDORES ==================== */
  .gauge-container {
    text-align: center;
  }

  .gauge-svg {
    width: 80px;
    height: 80px;
    margin: 0 auto;
  }

  .gauge-bg {
    fill: none;
    stroke: #e2e8f0;
    stroke-width: 8;
  }

  .gauge-fill {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.3s ease;
  }

  .gauge-text {
    font-size: 20px;
    font-weight: 700;
    fill: #2d3748;
  }

  .gauge-percentage {
    font-size: 13pt;
    font-weight: 700;
    color: #2d3748;
    margin-top: 4px;
  }

  .gauge-subtitle {
    font-size: 5.5pt;
    color: #718096;
    margin-top: 2px;
  }

  /* ==================== STATUS INDICATORS ==================== */
  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 5.5pt;
    font-weight: 600;
    padding: 3px 6px;
    border-radius: 3px;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .status-critical {
    background: #fed7d7;
    color: #742a2a;
  }

  .status-critical .status-dot {
    background: #e53e3e;
  }

  .status-warning {
    background: #feebc8;
    color: #744210;
  }

  .status-warning .status-dot {
    background: #ed8936;
  }

  .status-success {
    background: #c6f6d5;
    color: #22543d;
  }

  .status-success .status-dot {
    background: #38a169;
  }

  .status-info {
    background: #bee3f8;
    color: #1e4e8c;
  }

  .status-info .status-dot {
    background: #4299e1;
  }

  /* ==================== ALERT CARDS ==================== */
  .alert-card {
    background: white;
    border-radius: 5px;
    padding: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .alert-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .alert-number {
    font-size: 18pt;
    font-weight: 700;
  }

  .alert-label {
    font-size: 6.5pt;
    color: #718096;
    text-transform: uppercase;
  }

  .alert-bars {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .alert-bar-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .alert-bar {
    flex: 1;
    height: 14px;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }

  .alert-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .alert-bar-label {
    font-size: 6pt;
    color: #4a5568;
    min-width: 50px;
  }

  .alert-bar-value {
    font-size: 6pt;
    font-weight: 600;
    min-width: 25px;
    text-align: right;
  }

  /* ==================== PROGRESS BARS ==================== */
  .progress-bar {
    width: 100%;
    height: 16px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 6pt;
    font-weight: 600;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  .progress-legend {
    display: flex;
    justify-content: space-between;
    margin-top: 3px;
    font-size: 5.5pt;
    color: #718096;
  }

  /* ==================== ECONOMIC CARD ==================== */
  .economic-card {
    background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
    border: 2px solid #e53e3e;
    border-radius: 6px;
    padding: 10px;
  }

  .economic-main {
    text-align: center;
    margin-bottom: 8px;
  }

  .economic-label {
    font-size: 6.5pt;
    color: #7b1e1e;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .economic-value {
    font-size: 28pt;
    font-weight: 700;
    color: #c53030;
  }

  .economic-breakdown {
    display: flex;
    justify-content: space-around;
    margin-bottom: 6px;
    padding: 6px;
    background: rgba(255,255,255,0.5);
    border-radius: 4px;
  }

  .breakdown-item {
    text-align: center;
  }

  .breakdown-value {
    font-size: 14pt;
    font-weight: 700;
    color: #742a2a;
  }

  .breakdown-label {
    font-size: 5.5pt;
    color: #7b1e1e;
    margin-top: 2px;
  }

  .economic-footer {
    font-size: 5.5pt;
    color: #7b1e1e;
    text-align: center;
  }

  /* ==================== TABLAS DE DATOS ==================== */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 7pt;
  }

  .data-table thead {
    background: linear-gradient(135deg, #367C2B 0%, #2d6322 100%);
    color: white;
  }

  .data-table th {
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 7pt;
  }

  .data-table td {
    padding: 5px 8px;
    border: 1px solid #e2e8f0;
    font-size: 6.5pt;
  }

  .data-table tbody tr:nth-child(even) {
    background-color: #f7fafc;
  }

  .data-table tbody tr:nth-child(odd) {
    background-color: white;
  }

  .data-table tbody tr:hover {
    background-color: #e6f4ea;
  }

  /* ==================== RECOMMENDATIONS ==================== */
  .recommendations {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
  }

  .recommendation-title {
    font-size: 9pt;
    font-weight: 600;
    color: #367C2B;
    margin-bottom: 8px;
    padding-bottom: 4px;
    border-bottom: 2px solid #367C2B;
  }

  .recommendation-list {
    list-style: none;
    padding: 0;
  }

  .recommendation-list li {
    padding: 4px 0 4px 20px;
    position: relative;
    font-size: 7.5pt;
    line-height: 1.4;
  }

  .recommendation-list li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #F5A800;
    font-weight: 700;
  }
`;

// ============================================================================
// ESTILOS ESPECÍFICOS: PORTADA
// ============================================================================

const ESTILOS_PORTADA = `
  /* Override @page para portada sin márgenes */
  .page-portada {
    width: 100%;
    min-height: 210mm;
    max-height: 210mm;
    position: relative;
    overflow: hidden;
    page-break-after: always;
    page-break-inside: avoid;
    padding: 0;
    margin: 0;
  }

  /* Página 1: Portada Principal - Usando tabla para compatibilidad PDF */
  .portada-header {
    display: table;
    width: 100%;
    height: 210mm;
    table-layout: fixed;
    border-collapse: collapse;
    position: relative;
    margin: 0;
    padding: 0;
  }

  .portada-left-image {
    display: table-cell;
    width: 35%;
    height: 210mm;
    vertical-align: middle;
    padding: 0;
    margin: 0;
  }

  .portada-left-image img {
    width: 100%;
    height: 210mm;
    display: block;
  }

  .portada-content {
    display: table-cell;
    width: 65%;
    height: 210mm;
    vertical-align: middle;
    background-color: #367C2B;
    padding: 40px;
    text-align: center;
  }

  .portada-content h1 {
    margin: 0 0 20px 0;
    font-size: 48px;
    font-weight: 700;
    color: white;
    line-height: 1.2;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  }

  .portada-content .csc-label {
    font-size: 32px;
    color: #F5A800;
    font-weight: bold;
    margin: 10px 0;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  }

  .portada-content .cliente-info {
    font-size: 28px;
    color: white;
    margin: 8px 0;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  }

  .portada-content .periodo-label {
    font-size: 24px;
    color: white;
    margin: 20px 0 5px 0;
    font-weight: 500;
  }

  .portada-content .periodo-dates {
    font-size: 24px;
    color: #F5A800;
    font-weight: 700;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
  }

  .logo-superior-derecha {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 200px;
    height: auto;
    z-index: 10;
  }

  .logo-inferior-derecha {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 200px;
    height: auto;
    z-index: 10;
  }

  /* Página 2: Imagen Institucional - Sin flexbox para compatibilidad PDF */
  .portada-institucional {
    background-color: #f8f9fa;
    width: 100%;
    height: 210mm;
    margin: 0;
    padding: 20mm;
    text-align: center;
    box-sizing: border-box;
    position: relative;
  }

  .imagen-institucional-full {
    max-width: 100%;
    max-height: 170mm;
    width: auto;
    height: auto;
    display: inline-block;
    vertical-align: middle;
  }

  /* Helper para centrado vertical */
  .portada-institucional::before {
    content: '';
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }
`;

// ============================================================================
// ESTILOS ESPECÍFICOS: TABLA DE CONTENIDOS
// ============================================================================

const ESTILOS_CONTENIDOS = `
  .page-contenidos {
    width: 100%;
    min-height: 210mm;
    max-height: 210mm;
    padding: 30px 60px;
    background-color: #f5f5f5;
    page-break-after: always;
    page-break-inside: avoid;
    box-sizing: border-box;
    overflow: hidden;
  }

  .contenidos-container {
    background-color: white;
    padding: 40px;
    border-radius: 12px;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .contenidos-title {
    text-align: center;
    font-size: 32px;
    color: #e59500;
    margin-bottom: 30px;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 3px solid #e59500;
    padding-bottom: 15px;
  }

  .contenidos-list {
    list-style: none;
    counter-reset: item;
    padding: 0;
    margin: 0;
  }

  .contenidos-list li {
    counter-increment: item;
    margin-bottom: 20px;
    font-size: 20px;
    line-height: 1.6;
    padding-left: 50px;
    position: relative;
  }

  .contenidos-list li::before {
    content: counter(item) ".";
    position: absolute;
    left: 0;
    font-weight: bold;
    color: #367C2B;
    font-size: 24px;
    width: 40px;
    text-align: right;
  }

  .contenidos-list a {
    text-decoration: none;
    color: #212529;
    font-weight: 600;
    transition: color 0.2s ease;
    display: block;
  }

  .contenidos-list a:hover {
    color: #367C2B;
    text-decoration: underline;
  }

  .contenidos-footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid #e9ecef;
    text-align: center;
    font-size: 14px;
    color: #6c757d;
  }
`;

// ============================================================================
// ESTILOS ESPECÍFICOS: PÁGINAS PROMOCIONALES
// ============================================================================

const ESTILOS_PROMOCIONALES = `
  .page-promo-modem,
  .page-promo-protect {
    width: 100%;
    min-height: 210mm;
    max-height: 210mm;
    padding: 30px;
    background-color: white;
    page-break-before: always;  /* Siempre inicia en página nueva */
    page-break-after: always;   /* Siempre salta después */
    page-break-inside: avoid;   /* No se divide internamente */
    box-sizing: border-box;
    overflow: hidden;
  }

  .promo-container,
  .protect-container {
    display: table;
    width: 100%;
    height: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }

  .promo-text,
  .protect-text {
    display: table-cell;
    width: 50%;
    padding-right: 20px;
    text-align: justify;
    vertical-align: top;
  }

  .promo-text h3,
  .protect-text h3 {
    font-size: 28px;
    color: #367C2B;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .protect-text h3 {
    font-size: 26px;
  }

  .protect-text h4 {
    font-size: 20px;
    color: #F5A800;
    margin-top: 20px;
    margin-bottom: 10px;
    font-weight: 700;
  }

  .promo-text p,
  .protect-text p {
    font-size: 18px;
    line-height: 1.8;
    color: #212529;
    margin-bottom: 12px;
  }

  .protect-text p {
    font-size: 16px;
    line-height: 1.7;
  }

  .promo-text strong {
    color: #F5A800;
    font-weight: 700;
  }

  .protect-text strong {
    color: #367C2B;
    font-weight: 700;
  }

  .protect-text ul {
    font-size: 15px;
    line-height: 1.6;
    color: #212529;
    padding-left: 25px;
    margin: 15px 0;
  }

  .protect-text ul li {
    margin-bottom: 8px;
  }

  .promo-image,
  .protect-image {
    display: table-cell;
    width: 50%;
    vertical-align: top;
    padding-left: 20px;
  }

  .promo-image img,
  .protect-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

// ============================================================================
// ESTILOS ESPECÍFICOS: CÓDIGOS DE DIAGNÓSTICO (DTC)
// ============================================================================

const ESTILOS_DTC = `
  /* Header de equipo */
  .equipment-header {
    border-radius: 8px;
    padding: 15px 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .equipment-header-critico {
    background: linear-gradient(135deg, #f8d7da 0%, #f5c2c7 100%);
    border: 2px solid #e5a3ab;
  }

  .equipment-header-atencion {
    background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
    border: 2px solid #ffc107;
  }

  .equipment-title {
    font-size: 14pt;
    font-weight: bold;
    color: #333;
  }

  .equipment-serie {
    font-size: 9pt;
    color: #555;
    margin-top: 5px;
  }

  .codes-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 9pt;
    font-weight: bold;
    color: white;
  }

  .codes-badge-critico {
    background-color: #721c24;
  }

  .codes-badge-atencion {
    background-color: #ff8800;
  }

  /* Sección de códigos */
  .codes-section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }

  .section-header {
    padding: 10px 15px;
    font-weight: bold;
    font-size: 11pt;
    margin-bottom: 10px;
    color: #333;
  }

  .section-header-high {
    border-left: 4px solid #dc3545;
    background-color: #f8d7da;
  }

  .section-header-medium {
    border-left: 4px solid #ffc107;
    background-color: #fff3cd;
  }

  .section-header-low {
    border-left: 4px solid #28a745;
    background-color: #d4edda;
  }

  /* Tablas DTC */
  .dtc-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }

  .dtc-table thead {
    background-color: #495057;
    color: white;
  }

  .dtc-table th {
    padding: 10px;
    text-align: left;
    font-weight: bold;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dtc-table th:nth-child(3),
  .dtc-table th:nth-child(4) {
    text-align: center;
  }

  .dtc-table tbody tr {
    page-break-inside: avoid;
  }

  .dtc-table tbody tr:nth-child(odd) {
    background-color: #ffffff;
  }

  .dtc-table tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }

  .dtc-table tbody tr:hover {
    background: #e9ecef;
  }

  .dtc-table td {
    padding: 8px 10px;
    border-bottom: 1px solid #dee2e6;
    color: #4a5568;
    vertical-align: top;
    font-size: 9pt;
  }

  /* Columna código */
  .dtc-table td:first-child {
    font-family: 'Courier New', monospace;
    font-weight: bold;
    white-space: nowrap;
    width: 15%;
  }

  /* Columna descripción */
  .dtc-table td:nth-child(2) {
    width: 60%;
    line-height: 1.4;
    word-wrap: break-word;
  }

  /* Columna frecuencia */
  .dtc-table td:nth-child(3) {
    text-align: center;
    font-weight: bold;
    width: 10%;
  }

  /* Columna severidad */
  .dtc-table td:nth-child(4) {
    text-align: center;
    width: 15%;
  }

  /* Badges de severidad */
  .severity-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 9pt;
    color: white;
    letter-spacing: 1px;
  }

  .severity-high {
    background-color: #dc3545;
  }

  .severity-medium {
    background-color: #ffc107;
    color: #333;
  }

  .severity-low {
    background-color: #28a745;
  }
`;

// ============================================================================
// ESTILOS ESPECÍFICOS: PÁGINAS DE SECCIONES
// ============================================================================

const ESTILOS_SECCIONES = `
  /* Páginas de contenido específicas */
  .page-conectividad,
  .page-utilizacion,
  .page-dtc,
  .page-fluidos,
  .page-ea,
  .page-acciones,
  .page-contactos,
  .page-resumen-1,
  .page-resumen-2 {
    width: 100%;
    min-height: 210mm;
    max-height: 210mm;
    padding: 15mm 10mm;
    background-color: white;
    page-break-after: always;
    page-break-inside: avoid;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }

  /* Botón volver al contenido */
  .btn-volver {
    font-size: 7pt;
    color: #F5A800;
    text-decoration: none;
    font-weight: 600;
    margin-left: auto;
  }

  /* KPI Gauges Container - Tabla para compatibilidad PDF */
  .kpi-gauges {
    display: table;
    width: 100%;
    max-width: 700px;
    margin: 15px auto;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 20px 0;
  }

  .gauge-card {
    display: table-cell;
    width: 50%;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    vertical-align: top;
  }

  .gauge-title {
    font-size: 8pt;
    color: #4a5568;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .gauge-badge {
    font-size: 6.5pt;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 4px;
    margin-top: 8px;
    display: inline-block;
  }

  .badge-success {
    background: #c6f6d5;
    color: #22543d;
  }

  .badge-warning {
    background: #feebc8;
    color: #744210;
  }

  .badge-critical {
    background: #fed7d7;
    color: #742a2a;
  }

  /* Texto de periodo */
  .periodo-text {
    text-align: center;
    font-size: 7pt;
    color: #718096;
    margin: 10px 0 15px 0;
  }

  /* Secciones de tabla */
  .table-section {
    margin-bottom: 15px;
  }

  .table-title {
    font-size: 9pt;
    font-weight: 700;
    color: #367C2B;
    margin-bottom: 5px;
  }

  .table-subtitle {
    font-size: 6.5pt;
    color: #718096;
    margin-bottom: 8px;
  }

  .table-summary {
    font-size: 6.5pt;
    color: #4a5568;
    padding: 8px 12px;
    background: #f7fafc;
    border-radius: 4px;
    margin-top: 8px;
  }

  .table-footer tr {
    background: #edf2f7 !important;
    border-top: 2px solid #367C2B;
  }

  /* Tabla de utilización específica */
  .utilizacion-table thead th {
    font-size: 6pt;
    padding: 4px;
  }

  .utilizacion-table tbody td {
    font-size: 6pt;
    padding: 3px 4px;
  }

  /* Cajas educativas y alertas */
  .educational-box {
    background: #fffbf0;
    border: 1px solid #f59e0b;
    border-radius: 6px;
    padding: 12px;
    margin-top: 15px;
  }

  .educational-title {
    font-size: 8pt;
    color: #92400e;
    margin-bottom: 6px;
    font-weight: 700;
  }

  .educational-text {
    font-size: 7pt;
    line-height: 1.5;
    color: #78350f;
  }

  .alert-box-yellow {
    display: flex;
    gap: 10px;
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .alert-icon-yellow {
    font-size: 16pt;
    flex-shrink: 0;
  }

  .alert-content {
    flex: 1;
  }

  .alert-title-yellow {
    font-size: 8pt;
    font-weight: 700;
    color: #92400e;
    margin-bottom: 4px;
  }

  .alert-text {
    font-size: 7pt;
    line-height: 1.4;
    color: #78350f;
    margin-bottom: 6px;
  }

  .alert-emphasis {
    font-size: 7pt;
    line-height: 1.4;
    color: #92400e;
  }

  /* Sección de contactos - Tabla para compatibilidad PDF */
  .contactos-grid {
    display: table;
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 20px 0;
    margin-top: 20px;
  }

  .contacto-card {
    display: table-cell;
    width: 50%;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 15px;
    vertical-align: top;
  }

  .contacto-card h4 {
    font-size: 9pt;
    color: #367C2B;
    margin-bottom: 10px;
  }

  .contacto-list {
    list-style: none;
    padding: 0;
  }

  .contacto-list li {
    font-size: 7pt;
    padding: 4px 0;
    color: #4a5568;
  }
`;

// ============================================================================
// FUNCIÓN PRINCIPAL: OBTENER ESTILOS COMPLETOS
// ============================================================================

/**
 * Retorna todos los estilos CSS consolidados
 * @returns {String} Bloque CSS completo listo para inyectar en <head>
 */
function obtenerEstilosCompletos() {
  return CSS_VARIABLES +
         ESTILOS_GLOBALES +
         ESTILOS_LAYOUT +
         ESTILOS_COMPONENTES +
         ESTILOS_PORTADA +
         ESTILOS_CONTENIDOS +
         ESTILOS_PROMOCIONALES +
         ESTILOS_DTC +
         ESTILOS_SECCIONES;
}
