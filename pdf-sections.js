
// ============================================================================
// SECCIÓN: PÁGINA PROMOCIONAL - MODEM M
// ============================================================================

/**
 * Genera la página promocional del Modem M para equipos sin conectividad
 * @param {String} imagenModemM - Imagen base64 de la promoción del Modem M
 * @returns {String} HTML de la página promocional
 */
function generarPaginaModemM(imagenModemM) {
  return `

    <div class="page-promo-modem">
      <div class="promo-container">
        <div class="promo-text">
          <h3>📡 ¿Sus equipos no están reportando?</h3>
          <p>
            La conectividad es crucial para la gestión eficiente de su flota. Si algunos de sus equipos no están reportando,
            le recomendamos asegurar la conectividad de todas sus máquinas implementando el <strong>Modem M</strong>.
            No se pierda de ninguna información vital para la operación y el mantenimiento de sus equipos,
            manteniendo el control total sobre su flota.
          </p>
        </div>
        <img src="data:image/png;base64,${imagenModemM}" alt="Promoción Modem M" class="promo-image" />
      </div>
    </div>
  `;
}

// ============================================================================
// SECCIÓN: PÁGINA PROMOCIONAL - JOHN DEERE PROTECT
// ============================================================================

/**
 * Genera la página promocional de John Deere Protect
 * @param {String} imagenJDProtect - Imagen base64 de la promoción de JD Protect
 * @returns {String} HTML de la página promocional
 */
function generarPaginaJohnDeereProtect(imagenJDProtect) {
  return `

    <div class="page-promo-protect">
      <div class="protect-container">
        <div class="protect-text">
          <h3>¿Ya conoces qué es John Deere Protect?</h3>
          <p>
            John Deere Protect es un conjunto de soluciones posventa diseñadas para mejorar la productividad
            y disponibilidad de tus equipos. Entre sus beneficios destacan:
          </p>
          <ul>
            <li>Previsibilidad de gastos y menor costo de propiedad durante la vida útil del equipo.</li>
            <li>Cobertura en caso de costos de reparación por posibles fallas inesperadas.</li>
            <li>Análisis de aceite.</li>
            <li>Monitoreo constante e informes personalizados.</li>
            <li>Reprogramación remota de software.</li>
            <li>Mejora en los tiempos de respuesta.</li>
            <li>Repuestos y fluidos originales.</li>
            <li>Mayor control sobre la gestión operativa de la flota.</li>
            <li>Diagnóstico temprano para evitar pérdidas de tiempo y dinero.</li>
          </ul>

          <h4>Planes disponibles:</h4>
          <p>
            <strong>PLAN PREMIUM:</strong> El plan más completo, que conecta totalmente al cliente con el Ecosistema John Deere.
            Incluye repuestos originales y mano de obra especializada para el 100% de los servicios, además de consultoría
            del Centro de Soluciones Conectadas.
          </p>
          <p>
            <strong>PLAN ESENCIAL:</strong> Paquete de piezas originales para mantenimiento preventivo con regulación de válvulas
            e inspecciones realizadas por IPESA (si aplica). La mano de obra es opcional, permitiendo al cliente realizar
            autoservicio o contratar mano de obra según necesidad.
          </p>
        </div>
        <img src="data:image/png;base64,${imagenJDProtect}" alt="John Deere Protect" class="protect-image" />
      </div>
    </div>
  `;
}

// ============================================================================
// SECCIÓN: CONTACTOS
// ============================================================================

/**
 * Genera la sección de Contactos
 * @param {Object} cliente - Objeto cliente con contactos
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @returns {String} HTML de la sección completa
 */
function generarSeccionContactos(cliente, periodo) {

  // ============================================
  // 1. OBTENER CONTACTOS DEL CLIENTE
  // ============================================
  const contactos = cliente.contactos || [];

  // ============================================
  // 2. GENERAR FILAS DE TABLA DE CONTACTOS
  // ============================================
  let filasContactos = '';

  if (contactos.length === 0) {
    filasContactos = `
      <tr>
        <td colspan="4" style="text-align:center; padding:30px; color:#718096; font-size:14px;">
          ℹ️ No hay contactos registrados para este cliente
        </td>
      </tr>
    `;
  } else {
    contactos.forEach(contacto => {
      const cargo = contacto.cargo || '-';
      const nombre = contacto.nombre || '-';

      // Email con enlace mailto
      const correo = contacto.correo
        ? `<a href="mailto:${contacto.correo}" style="color:#4299e1; text-decoration:none;">${contacto.correo}</a>`
        : '-';

      // Celular con enlace tel
      const celular = contacto.celular
        ? `<a href="tel:${contacto.celular}" style="color:#4299e1; text-decoration:none;">${contacto.celular}</a>`
        : '-';

      filasContactos += `
        <tr>
          <td>${cargo}</td>
          <td>${nombre}</td>
          <td>${correo}</td>
          <td>${celular}</td>
        </tr>
      `;
    });
  }

  // ============================================
  // 3. ENSAMBLAR HTML COMPLETO
  // ============================================
  return `
    <div class="page page-contactos" id="contactos">

      <!-- Header de sección -->
      <div class="header">
        <h1>📞 CONTACTOS</h1>
        <div class="header-subtitle">Periodo: del ${periodo.inicio} al ${periodo.fin}</div>
      </div>

      <!-- TABLA DE CONTACTOS DEL CLIENTE -->
      <div class="table-section">
        <h3 class="table-title">Contactos del Cliente</h3>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width:20%;">Cargo</th>
              <th style="width:30%;">Nombre</th>
              <th style="width:30%;">Correo</th>
              <th style="width:20%;">Celular</th>
            </tr>
          </thead>
          <tbody>
            ${filasContactos}
          </tbody>
        </table>
      </div>

      <!-- CONTACTOS IPESA -->
      <div class="contacto-ipesa-box">
        <h3 class="contacto-ipesa-title">📧 CONTACTO IPESA</h3>
        <p class="contacto-ipesa-text">
          CSC IPESA: <a href="mailto:solucionesintegradas@ipesa.com.pe" style="color:#1a202c; font-weight:700; text-decoration:none;">solucionesintegradas@ipesa.com.pe</a>
        </p>
      </div>

      <!-- RECUADRO INFORMATIVO -->
      <div class="info-box-blue">
        <div class="info-icon">ℹ️</div>
        <div class="info-content">
          <h4 class="info-title">¿Los contactos actuales no son los correctos?</h4>
          <p class="info-text">
            Si los contactos proporcionados no corresponden al área de gestión de su flota,
            no dude en ponerse en contacto con nosotros para actualizar la información y
            asegurarnos que estos reportes lleguen a las personas adecuadas dentro de su empresa.
          </p>
        </div>
      </div>

    </div>
  `;
}
