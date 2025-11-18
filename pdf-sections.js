/**
 * Genera la sección de Conectividad y Próximo Mantenimiento
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} periodo - {inicio: "01-08-25", fin: "24-08-25"}
 * @returns {String} HTML de la sección completa
 */
function generarConectividad(equipos, periodo) {
  
  // ============================================
  // 1. CALCULAR MÉTRICAS DE CONECTIVIDAD
  // ============================================
  const totalEquipos = equipos.length;
  let equiposConectados = 0;
  let equiposMantenimiento = 0;
  
  equipos.forEach(eq => {
    const conectado = estaConectadoUltimosDias(eq.ult_conexion, 15);
    if (conectado) {
      equiposConectados++;
      // Solo contar mantenimiento si está conectado
      if (eq.horas_restantes > 0 && eq.horas_restantes < 50) {
        equiposMantenimiento++;
      }
    }
  });
  
  const porcentajeConectadas = totalEquipos > 0 
    ? ((equiposConectados / totalEquipos) * 100).toFixed(0) 
    : 0;
    
  const porcentajeMantenimiento = equiposConectados > 0
    ? ((equiposMantenimiento / equiposConectados) * 100).toFixed(0)
    : 0;
  
  // ============================================
  // 2. GENERAR GAUGES SVG
  // ============================================
  
  // Estado del gauge según porcentaje
  const estadoConectividad = porcentajeConectadas >= 80 ? 'success' 
    : porcentajeConectadas >= 50 ? 'warning' 
    : 'critical';
  
  const estadoMantenimiento = porcentajeMantenimiento <= 20 ? 'success'
    : porcentajeMantenimiento <= 40 ? 'warning'
    : 'critical';
  
  // ✅ CORRECCIÓN: gaugeCircular (sin "generar")
  const gaugeConectividad = gaugeCircular({
    percent: Number(porcentajeConectadas),
    color: colorFor(estadoConectividad),
    subtitle: `${equiposConectados} de ${totalEquipos}`,
    size: 100,
    stroke: 8
  });
  
  // ✅ CORRECCIÓN: gaugeCircular (sin "generar")
  const gaugeMantenimiento = gaugeCircular({
    percent: Number(porcentajeMantenimiento),
    color: colorFor(estadoMantenimiento),
    subtitle: `${equiposMantenimiento} de ${equiposConectados}`,
    size: 100,
    stroke: 8
  });
  
  // Etiquetas de estado
  const etiquetaConectividad = porcentajeConectadas >= 80 ? 'ÓPTIMO' 
    : porcentajeConectadas >= 50 ? 'ATENCIÓN' 
    : 'CRÍTICO';
    
  const etiquetaMantenimiento = porcentajeMantenimiento <= 20 ? 'ÓPTIMO'
    : porcentajeMantenimiento <= 40 ? 'ATENCIÓN'
    : 'CRÍTICO';
  
  // ============================================
  // 3. FILTRAR EQUIPOS PARA TABLA 1
  // Próximos a Mantenimiento (conectados, <50h)
  // ============================================
  const equiposMantenimientoTabla = equipos
    .filter(eq => {
      const conectado = estaConectadoUltimosDias(eq.ult_conexion, 15);
      const hrs = eq.horas_restantes || 0;
      return conectado && hrs > 0 && hrs < 50;
    })
    .sort((a, b) => a.horas_restantes - b.horas_restantes); // Menor a mayor
  
  // ============================================
  // 4. FILTRAR EQUIPOS PARA TABLA 2
  // Sin Conexión (>15 días, todos)
  // ============================================
  const equiposSinConexion = equipos
    .filter(eq => !estaConectadoUltimosDias(eq.ult_conexion, 15))
    .sort((a, b) => {
      // Ordenar por fecha de última conexión (más antigua primero)
      const fechaA = a.ult_conexion ? new Date(a.ult_conexion) : new Date(0);
      const fechaB = b.ult_conexion ? new Date(b.ult_conexion) : new Date(0);
      return fechaA - fechaB;
    });
  
  // ============================================
  // 5. GENERAR FILAS DE TABLA 1
  // ============================================
  let filasMantenimiento = '';
  
  if (equiposMantenimientoTabla.length === 0) {
    filasMantenimiento = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px; color:#38a169;">
          ✅ Excelente! Ningún equipo conectado requiere mantenimiento próximo
        </td>
      </tr>
    `;
  } else {
    equiposMantenimientoTabla.forEach(eq => {
      const horasRestantes = eq.horas_restantes || 0;
      const colorHoras = horasRestantes < 10 ? '#e53e3e' 
        : horasRestantes < 30 ? '#ed8936' 
        : '#718096';
      
      const ubicacionLink = eq.latitud && eq.longitud
        ? `<a href="https://www.google.com/maps?q=${eq.latitud},${eq.longitud}" target="_blank" style="color:#4299e1; text-decoration:none;">📍 Ver</a>`
        : '-';
      
      const horometroFormat = eq.horas_trabajo_motor_vida_util 
        ? Number(eq.horas_trabajo_motor_vida_util).toLocaleString('en-US')
        : '-';
        
      const proxMtoFormat = eq.prox_mto 
        ? Number(eq.prox_mto).toLocaleString('en-US')
        : '-';
      
      filasMantenimiento += `
        <tr>
          <td>${eq.id_equipo || '-'}</td>
          <td>${eq.num_interno || '-'}</td>
          <td>${eq.familia || '-'}</td>
          <td style="text-align:center;">${ubicacionLink}</td>
          <td style="text-align:right;">${horometroFormat}</td>
          <td style="text-align:right;">${proxMtoFormat}</td>
          <td style="text-align:right; font-weight:700; color:${colorHoras};">
            ${horasRestantes}
          </td>
        </tr>
      `;
    });
  }
  
  // ============================================
  // 6. GENERAR FILAS DE TABLA 2
  // ============================================
  let filasSinConexion = '';
  
  if (equiposSinConexion.length === 0) {
    filasSinConexion = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px; color:#38a169;">
          ✅ Excelente! Todos los equipos están reportando correctamente
        </td>
      </tr>
    `;
  } else {
    equiposSinConexion.forEach(eq => {
      const ubicacionLink = eq.latitud && eq.longitud
        ? `<a href="https://www.google.com/maps?q=${eq.latitud},${eq.longitud}" target="_blank" style="color:#4299e1; text-decoration:none;">📍 Ver</a>`
        : '-';
      
      const horometroFormat = eq.horas_trabajo_motor_vida_util 
        ? Number(eq.horas_trabajo_motor_vida_util).toLocaleString('en-US')
        : '-';
      
      const ultConexion = eq.ult_conexion 
        ? Utilities.formatDate(new Date(eq.ult_conexion), "America/Lima", "dd/MM/yyyy")
        : 'Sin registro';
      
      filasSinConexion += `
        <tr>
          <td>${eq.id_equipo || '-'}</td>
          <td>${eq.num_interno || '-'}</td>
          <td>${eq.familia || '-'}</td>
          <td style="text-align:center;">${ubicacionLink}</td>
          <td style="text-align:right;">${horometroFormat}</td>
          <td style="text-align:center;">${ultConexion}</td>
        </tr>
      `;
    });
  }
  
  // ============================================
  // 7. ENSAMBLAR HTML COMPLETO
  // ============================================
  return `
    <div class="page page-conectividad">
      
      <!-- Header de sección -->
      <div class="section-header">
        <h2>CONECTIVIDAD DE EQUIPOS Y PRÓXIMO MANTENIMIENTO</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <!-- Indicadores Clave (2 Gauges) -->
      <div class="kpi-gauges">
        <div class="gauge-card">
          <h3 class="gauge-title">CONECTIVIDAD DE FLOTA</h3>
          ${gaugeConectividad}
          <div class="gauge-badge badge-${estadoConectividad}">
            ${etiquetaConectividad}
          </div>
        </div>
        
        <div class="gauge-card">
          <h3 class="gauge-title">PRÓXIMO MANTENIMIENTO</h3>
          ${gaugeMantenimiento}
          <div class="gauge-badge badge-${estadoMantenimiento}">
            ${etiquetaMantenimiento}
          </div>
        </div>
      </div>
      
      <!-- Periodo -->
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- TABLA 1: Máquinas Próximas a Mantenimiento -->
      <div class="table-section">
        <h3 class="table-title">🔧 Máquinas Próximas a Mantenimiento</h3>
        <p class="table-subtitle">Menos de 50 horas para el próximo servicio</p>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Serie</th>
              <th>N° Interno</th>
              <th>Familia</th>
              <th>Ubicación</th>
              <th>Horómetro</th>
              <th>Próx. MTO (h)</th>
              <th>Horas Restantes</th>
            </tr>
          </thead>
          <tbody>
            ${filasMantenimiento}
          </tbody>
        </table>
      </div>
      
      <!-- TABLA 2: Máquinas sin Conexión -->
      <div class="table-section">
        <h3 class="table-title">📡 Máquinas sin Conexión</h3>
        <p class="table-subtitle">Más de 15 días sin reportar</p>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>N° Serie</th>
              <th>N° Interno</th>
              <th>Familia</th>
              <th>Ubicación</th>
              <th>Horómetro</th>
              <th>Última Conexión</th>
            </tr>
          </thead>
          <tbody>
            ${filasSinConexion}
          </tbody>
        </table>
      </div>
      
    </div>
  `;
}


/**
 * Genera la sección de Análisis de Utilización y Gestión de Ralentí
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} metricas - Objeto con métricas calculadas del cliente
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @returns {String} HTML de la sección completa
 */
function generarUtilizacion(equipos, metricas, periodo, precioPorGalon) {

  // ============================================
  // 1. EXTRAER MÉTRICAS NECESARIAS
  // ============================================
  const totales = metricas.totales || {};
  const equiposExcesoRalenti = safeInt(totales.equiposExcesoRalenti);
  
  // ============================================
  // 2. FILTRAR EQUIPOS PARA TABLA
  // ============================================
  const UMBRAL_MINIMO_HORAS = 1; // Superior a 1 hora
  
  const equiposOperativos = equipos
    .filter(eq => {
      const horasTotal = safeNum(eq.horas_total_general);
      const pctRalenti = safeNum(eq.percent_ralent_horas);
      
      // Solo equipos que operaron más de 1 hora y tienen datos válidos
      return horasTotal > UMBRAL_MINIMO_HORAS && 
             pctRalenti > 0.01 &&
             pctRalenti < 1.0; // Excluir 100% (datos inválidos)
    })
    .sort((a, b) => {
      // Ordenar por % ralentí descendente (peores primero)
      const pctA = safeNum(a.percent_ralent_horas);
      const pctB = safeNum(b.percent_ralent_horas);
      return pctB - pctA;
    });
  
  // ============================================
  // 3. GENERAR FILAS DE TABLA
  // ============================================
  let filasTabla = '';
  let totalHorasTrabajo = 0;
  let totalHorasRalenti = 0;
  let totalHorasTotales = 0;
  let totalCombPerdido = 0;
  let totalPerdidaUSD = 0;
  
  if (equiposOperativos.length === 0) {
    filasTabla = `
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:#718096; font-size:16px;">
          ℹ️ No hay equipos con datos operativos en este periodo
        </td>
      </tr>
    `;
  } else {
    equiposOperativos.forEach(eq => {
      // Datos del equipo
      const horasTrabajo = safeNum(eq.horas_funcionamiento_general);
      const horasRalentiEq = safeNum(eq.horas_ralenti_general);
      const horasTotales = safeNum(eq.horas_total_general);
      const pctRalenti = safeNum(eq.percent_ralent_horas) * 100;
      const combPerdido = safeNum(eq.comb_perdido_ral);
      const perdidaUSD = safeNum(eq.impacto_economico_ral);
      
      // Acumular totales
      totalHorasTrabajo += horasTrabajo;
      totalHorasRalenti += horasRalentiEq;
      totalHorasTotales += horasTotales;
      totalCombPerdido += combPerdido;
      // totalPerdidaUSD += perdidaUSD;  // ❌ NO sumar (tiene redondeos acumulados)
      
      // Determinar color según % ralentí
      let colorPct = '';
      
      if (pctRalenti < 15) {
        colorPct = '#38a169'; // Verde - Óptimo
      } else if (pctRalenti < 20) {
        colorPct = '#d69e2e'; // Amarillo - Moderado
      } else if (pctRalenti < 30) {
        colorPct = '#ed8936'; // Naranja - Atención
      } else {
        colorPct = '#e53e3e'; // Rojo - Crítico
      }
      
      // Formatear valores
      const horasTrabajoFormat = horasTrabajo.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      const horasRalentiFormat = horasRalentiEq.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      const horasTotalesFormat = horasTotales.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      const combPerdidoFormat = combPerdido.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      const perdidaUSDFormat = perdidaUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      
      filasTabla += `
        <tr>
          <td>${eq.id_equipo || '-'}</td>
          <td>${eq.modelo || '-'}</td>
          <td style="text-align:right;">${horasTrabajoFormat}</td>
          <td style="text-align:right;">${horasRalentiFormat}</td>
          <td style="text-align:right;">${horasTotalesFormat}</td>
          <td style="text-align:right; font-weight:700; color:${colorPct};">
            ${pctRalenti.toFixed(0)}%
          </td>
          <td style="text-align:right;">${combPerdidoFormat}</td>
          <td style="text-align:right; font-weight:700;">$${perdidaUSDFormat}</td>
        </tr>
      `;
    });
    
    // ✅ CALCULAR impacto económico total SIN redondeos acumulados
    totalPerdidaUSD = totalCombPerdido * precioPorGalon;
  }
  
  // ============================================
  // 4. FORMATEAR TOTALES (usar los calculados)
  // ============================================
  const combFormat = totalCombPerdido.toLocaleString('en-US', {maximumFractionDigits: 0});
  const perdidaFormat = totalPerdidaUSD.toLocaleString('en-US', {maximumFractionDigits: 0});
  
  // ============================================
  // 5. GENERAR FOOTER DE TABLA
  // ============================================
  const footerTabla = equiposOperativos.length > 0 ? `
    <tfoot>
      <tr class="table-footer">
        <td colspan="2" style="text-align:right; font-weight:700;">TOTALES:</td>
        <td style="text-align:right; font-weight:700;">${totalHorasTrabajo.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
        <td style="text-align:right; font-weight:700;">${totalHorasRalenti.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
        <td style="text-align:right; font-weight:700;">${totalHorasTotales.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
        <td style="text-align:right;">-</td>
        <td style="text-align:right; font-weight:700;">${totalCombPerdido.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
        <td style="text-align:right; font-weight:700; color:#e53e3e;">$${perdidaFormat}</td>
      </tr>
    </tfoot>
  ` : '';
  
  // ============================================
  // 6. GENERAR RESUMEN BAJO TABLA
  // ============================================
  const equiposConExceso = equiposOperativos.filter(eq => safeNum(eq.percent_ralent_horas) > 0.15).length;
  const equiposOptimos = equiposOperativos.length - equiposConExceso;
  const pctExceso = equiposOperativos.length > 0
    ? ((equiposConExceso / equiposOperativos.length) * 100).toFixed(0)
    : 0;
  const pctOptimo = equiposOperativos.length > 0
    ? ((equiposOptimos / equiposOperativos.length) * 100).toFixed(0)
    : 0;
  
  const resumenTabla = equiposOperativos.length > 0 ? `
    <div class="table-summary">
      📊 <strong>${equiposOperativos.length} equipos operativos</strong> en el periodo | 
      ⚠️ <strong>${equiposConExceso}</strong> (${pctExceso}%) superan el umbral del 15% | 
      ✅ <strong>${equiposOptimos}</strong> (${pctOptimo}%) operan de manera óptima
    </div>
  ` : '';
  
  // ============================================
  // 7. GENERAR RECUADRO EDUCATIVO (solo si hay exceso)
  // ============================================
  const recuadroEducativo = equiposExcesoRalenti > 0 ? `
    <div class="educational-box">
      
      <div class="alert-box-yellow">
        <div class="alert-icon-yellow">💡</div>
        <div class="alert-content">
          <h5 class="alert-title-yellow">¿Sabía que el Ralentí Excesivo Afecta su Motor?</h5>
          <p class="alert-text">
            El exceso de ralentí se calcula como la diferencia entre el porcentaje de ralentí real y el valor 
            recomendado por fábrica. Si el porcentaje real supera el umbral del 15%, se considera exceso de ralentí. 
            Un exceso de ralentí puede reducir la vida útil del motor, aumentar el consumo de combustible y generar 
            costos de mantenimiento elevados.
          </p>
          <p class="alert-emphasis">
            ¡Es importante optimizar el uso de las máquinas para <strong>evitar daños</strong> y mejorar la rentabilidad a largo plazo!
          </p>
        </div>
      </div>
      
      <h4 class="educational-title">💰 Estimación de Ahorro:</h4>
      <p class="educational-text">
        Si se hubiera evitado el exceso de ralentí, se habrían ahorrado aproximadamente 
        <strong>${combFormat} galones de combustible</strong>. 
        Considerando un precio de <strong>$${precioPorGalon.toFixed(2)} por galón</strong>, el ahorro estimado sería de 
        <strong style="color:#c2410c; font-size:18px;">$${perdidaFormat}</strong> 
        en el periodo con respecto a toda la flota.
      </p>
    </div>
  ` : '';
  
  // ============================================
  // 8. ENSAMBLAR HTML COMPLETO
  // ============================================
  return `
    <div class="page page-utilizacion">
      
      <!-- Header de sección -->
      <div class="section-header">
        <h2>ANÁLISIS DE UTILIZACIÓN Y GESTIÓN DE RALENTÍ</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <!-- Periodo -->
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- TABLA DE EQUIPOS OPERATIVOS -->
      <div class="table-section">
        <h3 class="table-title">📊 UTILIZACIÓN DE EQUIPOS OPERATIVOS</h3>
        <p class="table-subtitle">
          Equipos con actividad operativa en el periodo (ordenados por % de ralentí)
        </p>
        
        <table class="data-table utilizacion-table">
          <thead>
            <tr>
              <th>N° Serie</th>
              <th>Modelo</th>
              <th>Hrs<br>Trabajo</th>
              <th>Hrs<br>Ralentí</th>
              <th>Hrs<br>Totales</th>
              <th>%<br>Ralentí</th>
              <th>Pérdida<br>(gal)</th>
              <th>Impacto<br>($)</th>
            </tr>
          </thead>
          <tbody>
            ${filasTabla}
          </tbody>
          ${footerTabla}
        </table>
        
        ${resumenTabla}
      </div>
      
      <!-- RECUADRO EDUCATIVO (solo si hay exceso) -->
      ${recuadroEducativo}
      
    </div>
  `;
}
// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera mensaje simplificado cuando no hay análisis
 */
function generarMensajeSinAnalisis(periodo, imagenBase64) {
  return `
    <div class="page page-fluidos">
      
      <div class="section-header">
        <h2>ANÁLISIS DE FLUIDOS</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- Mensaje compacto sin análisis -->
      <div class="fluidos-mensaje-simple">
        <p class="mensaje-principal">
          No hay resultados de análisis de aceite para los equipos en este periodo.
        </p>
        <p class="mensaje-secundario">
          En caso de requerir análisis de aceite, le recordamos que IPESA pone a su 
          disposición <strong>ALS</strong>, un laboratorio internacionalmente reconocido 
          por su excelencia en análisis técnicos.
        </p>
        <p class="mensaje-cierre">
          Confíe en la experiencia de <strong>IPESA</strong> y <strong>ALS</strong> 
          para garantizar el mejor cuidado y rendimiento de sus equipos.
        </p>
      </div>
      
      <!-- Imagen promocional -->
      ${imagenBase64 ? `
        <div class="fluidos-imagen-container">
          <img src="data:image/png;base64,${imagenBase64}" 
               alt="Programa ALS" 
               class="fluidos-imagen-grande" />
        </div>
      ` : ''}
      
    </div>
  `;
}

/**
 * Genera el resumen de análisis (CON BARRAS VISUALES)
 */
function generarResumenAnalisis(totalMuestras, equiposAnalizados, totalEquipos,
                                 numAnormal, numPrecaucion, numNormal,
                                 pctAnormal, pctPrecaucion, pctNormal) {
  return `
    <div class="fluidos-resumen-box">
      <h3 class="fluidos-resumen-title">📊 RESUMEN DE ANÁLISIS</h3>
      
      <div class="fluidos-stats">
        <div class="fluidos-stat-row">
          <span class="stat-label">Total de muestras:</span>
          <span class="stat-value">${totalMuestras}</span>
        </div>
        <div class="fluidos-stat-row">
          <span class="stat-label">Equipos analizados:</span>
          <span class="stat-value">${equiposAnalizados} de ${totalEquipos}</span>
        </div>
      </div>
      
      <div class="fluidos-divider"></div>
      
      <h4 class="fluidos-subtitle">Resultados:</h4>
      <div class="fluidos-resultados">
        
        <!-- Anormal con barra -->
        <div class="resultado-item">
          <div class="resultado-header">
            <span class="resultado-label">🔴 Anormal:</span>
            <span class="resultado-value">${numAnormal} (${pctAnormal}%)</span>
          </div>
          <div class="resultado-barra-container">
            <div class="resultado-barra anormal" style="width: ${pctAnormal}%;"></div>
          </div>
        </div>
        
        <!-- Precaución con barra -->
        <div class="resultado-item">
          <div class="resultado-header">
            <span class="resultado-label">🟡 Precaución:</span>
            <span class="resultado-value">${numPrecaucion} (${pctPrecaucion}%)</span>
          </div>
          <div class="resultado-barra-container">
            <div class="resultado-barra precaucion" style="width: ${pctPrecaucion}%;"></div>
          </div>
        </div>
        
        <!-- Normal con barra -->
        <div class="resultado-item">
          <div class="resultado-header">
            <span class="resultado-label">🟢 Normal:</span>
            <span class="resultado-value">${numNormal} (${pctNormal}%)</span>
          </div>
          <div class="resultado-barra-container">
            <div class="resultado-barra normal" style="width: ${pctNormal}%;"></div>
          </div>
        </div>
        
      </div>
    </div>
    
    <div class="fluidos-leyenda-box">
      <h4 class="leyenda-title">LEYENDA</h4>
      <div class="leyenda-item">
        <span class="leyenda-icono anormal">🔴</span>
        <span class="leyenda-texto">Anormal: Requiere acción correctiva inmediata</span>
      </div>
      <div class="leyenda-item">
        <span class="leyenda-icono precaucion">🟡</span>
        <span class="leyenda-texto">Precaución: Monitoreo y seguimiento necesario</span>
      </div>
      <div class="leyenda-item">
        <span class="leyenda-icono normal">🟢</span>
        <span class="leyenda-texto">Normal: Condiciones óptimas del fluido</span>
      </div>
    </div>
  `;
}

/**
 * Genera sección de muestras anormales
 */
function generarSeccionAnormales(muestras) {
  let html = `
    <div class="fluidos-section-header anormal">
      <h3 class="fluidos-section-title">🔴 RESULTADOS ANORMALES (${muestras.length})</h3>
      <p class="fluidos-section-subtitle">Atención inmediata requerida</p>
    </div>
  `;
  
  muestras.forEach(muestra => {
    html += `
      <div class="fluidos-card-anormal">
        <h4 class="fluidos-card-equipo">
          ${muestra.familia} - ${muestra.modelo} - ${muestra.num_interno}
        </h4>
        
        <div class="fluidos-card-content">
          <div class="fluidos-card-row">
            <span class="card-label">Compartimiento:</span>
            <span class="card-value">${muestra.compartimiento}</span>
          </div>
          <div class="fluidos-card-row">
            <span class="card-label">N° Muestra:</span>
            <span class="card-value">${muestra.muestra}</span>
          </div>
        </div>
        
        <div class="fluidos-card-link">
          <a href="${muestra.pdf}" target="_blank" class="btn-informe">VER INFORME COMPLETO</a>
        </div>
      </div>
    `;
  });
  
  return html;
}

/**
 * Genera sección de muestras en precaución (MEJORADA)
 */
function generarSeccionPrecaucion(muestras) {
  let html = `
    <div class="fluidos-section-header precaucion">
      <h3 class="fluidos-section-title">🟡 RESULTADOS EN PRECAUCIÓN (${muestras.length})</h3>
      <p class="fluidos-section-subtitle">Seguimiento recomendado</p>
    </div>
  `;
  
  // Agrupar por equipo
  const porEquipo = agruparMuestrasPorEquipo(muestras);
  
  porEquipo.forEach(grupo => {
    html += `
      <div class="fluidos-grupo-equipo">
        <h4 class="fluidos-grupo-titulo">
          ${grupo.familia} - ${grupo.modelo} - ${grupo.num_interno}
        </h4>
        
        <table class="fluidos-tabla">
          <thead>
            <tr>
              <th style="width:50%;">COMPARTIMIENTO</th>
              <th style="width:30%;">MUESTRA</th>
              <th style="width:20%;">INFORME</th>
            </tr>
          </thead>
          <tbody>
            ${grupo.muestras.map(m => `
              <tr>
                <td>${m.compartimiento}</td>
                <td>${m.muestra}</td>
                <td style="text-align:center;">
                  <a href="${m.pdf}" target="_blank" class="link-ver">Ver Informe</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
  
  return html;
}

/**
 * Genera sección de muestras normales (MEJORADA CON TARJETAS)
 */
function generarSeccionNormales(muestras) {
  let html = `
    <div class="fluidos-section-header normal">
      <h3 class="fluidos-section-title">🟢 RESULTADOS NORMALES (${muestras.length})</h3>
    </div>
  `;
  
  // Agrupar por equipo
  const porEquipo = agruparMuestrasPorEquipo(muestras);
  
  porEquipo.forEach(grupo => {
    html += `
      <div class="fluidos-lista-equipo">
        <h4 class="fluidos-lista-titulo">
          ${grupo.familia} - ${grupo.modelo} - ${grupo.num_interno}
        </h4>
        <div class="fluidos-lista-items">
          ${grupo.muestras.map(m => `
            <div class="fluidos-lista-item">
              <span class="lista-bullet">•</span>
              <span class="lista-compartimiento">${m.compartimiento}</span>
              <span class="lista-muestra">Muestra: ${m.muestra}</span>
              <a href="${m.pdf}" target="_blank" class="lista-link">Ver Informe</a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  return html;
}

/**
 * Agrupa muestras por equipo
 */
function agruparMuestrasPorEquipo(muestras) {
  const grupos = {};
  
  muestras.forEach(m => {
    const key = m.id_equipo;
    
    if (!grupos[key]) {
      grupos[key] = {
        familia: m.familia,
        modelo: m.modelo,
        num_interno: m.num_interno,
        id_equipo: m.id_equipo,
        muestras: []
      };
    }
    
    grupos[key].muestras.push(m);
  });
  
  return Object.values(grupos);
}


/**
 * Genera la sección completa de Acciones y Recomendaciones
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @returns {String} HTML de la sección completa
 */


/**
 * =================================================================
 * COMPONENTES HTML - FUNCIONES AUXILIARES
 * =================================================================
 */

/**
 * Header con título y subtítulo
 */
function generarHeaderResumen(subtitle) {
  return `
    <div class="header">
      <h1>🚜 RESUMEN - GESTIÓN DE FLOTA</h1>
      <div class="header-subtitle">${subtitle}</div>
    </div>
  `;
}


/**
 * KPI Bar - 8 columnas con métricas principales
 */
function generarKPIBarResumen(metricas) {
  const tot = metricas.totales || {};
  const pct = metricas.porcentajes || {};
  const prom = metricas.promediosPorEquipo || {};

  return `
    <div class="kpi-bar">
      <div class="kpi-bar-row">
        <div class="kpi-item" data-type="info">
          <span class="kpi-value">${tot.totalEquipos || 0}</span>
          <span class="kpi-label">Total Equipos</span>
        </div>
        <div class="kpi-item" data-type="${pct.conectadas >= 80 ? 'success' : pct.conectadas >= 50 ? 'warning' : 'critical'}">
          <span class="kpi-value">${tot.conectados15d || 0}</span>
          <span class="kpi-label">Conectados (${pct.conectadas || 0}%)</span>
        </div>
        <div class="kpi-item" data-type="success">
          <span class="kpi-value">${tot.equiposTrabajando || 0}</span>
          <span class="kpi-label">En Operación</span>
        </div>
        <div class="kpi-item" data-type="critical">
          <span class="kpi-value">${(tot.totalEquipos - tot.conectados15d) || 0}</span>
          <span class="kpi-label">Desconectados</span>
        </div>
        <div class="kpi-item" data-type="${tot.equiposExcesoRalenti > 0 ? 'critical' : 'success'}">
          <span class="kpi-value">${tot.equiposExcesoRalenti || 0}</span>
          <span class="kpi-label">Exceso Ralentí</span>
        </div>
        <div class="kpi-item" data-type="warning">
          <span class="kpi-value">${Number(tot.horasRalenti || 0).toFixed(0)}h</span>
          <span class="kpi-label">Horas Ralentí</span>
        </div>
        <div class="kpi-item" data-type="info">
          <span class="kpi-value">${Number(tot.horasMotor || 0).toFixed(0)}h</span>
          <span class="kpi-label">Horas Motor</span>
        </div>
        <div class="kpi-item" data-type="info">
          <span class="kpi-value">${Number(prom.horasRalenti || 0).toFixed(1)}h</span>
          <span class="kpi-label">Promedio Ralentí</span>
        </div>
      </div>
    </div>
  `;
}


/**
 * Sección de Indicadores Clave con 4 gauges + barra de eficiencia
 */
function generarIndicadoresClaveResumen(metricas, data) {
  const tot = metricas.totales || {};
  const pct = metricas.porcentajes || {};

  return `
    <div class="section">
      <div class="section-header">
        <span class="section-icon">📊</span>
        Indicadores Clave de Desempeño
      </div>
      <div class="metrics-grid">
        <div class="metrics-grid-row">
          <div class="metric-card kpi-item">
            <div class="metric-title">Conectividad de Flota</div>
            ${data.gaugeConectividad}
            <div class="metric-footer">
              Equipos conectados (15d)
              <div class="status-indicator status-${data.estadoConectividadEtiqueta}">
                <span class="status-dot"></span>
                ${data.estadoConectividadTexto}
              </div>
            </div>
          </div>

          <div class="metric-card kpi-item">
            <div class="metric-title">Próximo Mantenimiento</div>
            ${data.gaugeMantenimiento}
            <div class="metric-footer">
              Mantenimiento (&lt;50h)
              <div class="status-indicator status-${data.estadoMantenimientoEtiqueta}">
                <span class="status-dot"></span>
                ${data.estadoMantenimientoTexto}
              </div>
            </div>
          </div>

          <div class="metric-card kpi-item">
            <div class="metric-title">Exceso de Ralentí</div>
            ${data.gaugeExcesoRalenti}
            <div class="metric-footer">
              Equipos ralentí (&gt;15%)
              <div class="status-indicator status-${data.estadoExcesoEtiqueta}">
                <span class="status-dot"></span>
                ${data.estadoExcesoTexto}
              </div>
            </div>
          </div>

          <div class="metric-card kpi-item">
            <div class="metric-title">Ralentí Total Flota</div>
            ${data.gaugePercentRalentiFlota}
            <div class="metric-footer">
              % Horas (ralentí vs motor)
              <div class="status-indicator status-${data.estadoRalentiEtiqueta}">
                <span class="status-dot"></span>
                ${data.estadoRalentiTexto}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BARRA DE EFICIENCIA -->
      <div class="efficiency-bar">
        <div class="efficiency-label">⏱️ EFICIENCIA OPERATIVA (Tiempo Motor vs Ralentí)</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${pct.ralentiFlota || 0}%;">
            <span class="progress-text">${pct.ralentiFlota || 0}% Ralentí</span>
          </div>
        </div>
        <div class="progress-legend">
          <span>🔴 Ralentí: ${Number(tot.horasRalenti || 0).toFixed(1)}h</span>
          <span>🟢 Productivo: ${(Number(tot.horasMotor || 0) - Number(tot.horasRalenti || 0)).toFixed(1)}h</span>
          <span>⚡ Total: ${Number(tot.horasMotor || 0).toFixed(1)}h</span>
        </div>
      </div>
    </div>
  `;
}


/**
 * Alertas Técnicas + Impacto Económico (Layout 75%/25%)
 */
function generarAlertasYEconomicoResumen(metricas, data) {
  const eco = metricas.economico || {};
  const tot = metricas.totales || {};
  const prom = metricas.promediosPorEquipo || {};

  return `
    <div class="alerts-economic-wrapper">
      <!-- ALERTAS TÉCNICAS (75%) -->
      <div class="alerts-group">
        <div class="section-header">
          <span class="section-icon">⚠️</span>
          Alertas Técnicas
        </div>
        <div class="alerts-grid">
          <div class="alerts-grid-row">
            <!-- ALERTA DTC -->
            <div class="alert-card kpi-item">
              <div class="alert-header">
                <div class="alert-number">${data.alertDTC}</div>
                <div class="alert-label">Códigos DTC</div>
              </div>
              <div class="alert-bars">
                ${data.alertDTCBars}
              </div>
            </div>

            <!-- ALERTA EXPERT ALERTS -->
            <div class="alert-card kpi-item">
              <div class="alert-header">
                <div class="alert-number">${data.alertEA}</div>
                <div class="alert-label">Expert Alerts</div>
              </div>
              <div class="alert-bars">
                ${data.alertEABars}
              </div>
            </div>

            <!-- ALERTA ACEITE -->
            <div class="alert-card kpi-item">
              <div class="alert-header">
                <div class="alert-number">${data.alertAceite}</div>
                <div class="alert-label">Análisis de Aceite</div>
              </div>
              <div class="alert-bars">
                ${data.alertAceiteBars}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- IMPACTO ECONÓMICO (25%) -->
      <div class="economic-group">
        <div class="section-header">
          <span class="section-icon">💰</span>
          Impacto Económico
        </div>
        <div class="economic-card">
          <div class="economic-main">
            <div class="economic-label">⚠️ PÉRDIDA ESTIMADA</div>
            <div class="economic-value">$${Number(eco.perdidaUSD_por_combustible || 0).toLocaleString()}</div>
          </div>
          <div class="economic-breakdown">
            <div class="breakdown-item">
              <div class="breakdown-value">${Number(tot.combPerdidoGal || 0).toFixed(0)} gal</div>
              <div class="breakdown-label">Combustible</div>
            </div>
            <div class="breakdown-item">
              <div class="breakdown-value">$${Number(eco.perdidaUSD_por_equipo || 0).toFixed(0)}</div>
              <div class="breakdown-label">Por Equipo</div>
            </div>
          </div>
          <div class="economic-footer">
            💵 $${Number(eco.precioPorGalon || 0).toFixed(2)}/gal • ⛽ ${Number(prom.combPerdidoGal || 0).toFixed(1)} gal/eq
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// SECCIÓN: PORTADA (PÁGINAS 1-2)
// ============================================================================



// ============================================================================
// SECCIÓN: TABLA DE CONTENIDOS (PÁGINA 3)
// ============================================================================

/**
 * Genera la tabla de contenidos con navegación interna
 * @returns {String} HTML de la página de contenidos
 */
function generarTablaContenidos() {
  return `
    <div class="page-contenidos">
      <div class="contenidos-container">
        <h2 id="contenido" class="contenidos-title">Contenido del Reporte</h2>

        <ol class="contenidos-list">
          <li><a href="#resumen">Resumen de la Gestión de Flota</a></li>
          <li><a href="#conectividad">Conectividad de Equipos y Próximo Mantenimiento</a></li>
          <li><a href="#utilizacion">Utilización de Equipos y Consumo de Combustible</a></li>
          <li><a href="#dtc">Códigos de Diagnóstico (DTC)</a></li>
          <li><a href="#fluidos">Análisis de Fluidos</a></li>
          <li><a href="#alerts">Expert Alerts</a></li>
          <li><a href="#recomendaciones">Acciones y Recomendaciones</a></li>
          <li><a href="#contactos">Contactos</a></li>
        </ol>

        <div class="contenidos-footer">
          📊 Reporte generado automáticamente por CSC IPESA
        </div>
      </div>
    </div>
  `;
}

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







