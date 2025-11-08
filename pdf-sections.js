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
  const economico = metricas.economico || {};

  const equiposExcesoRalenti = safeInt(totales.equiposExcesoRalenti);
  const combPerdidoGal = safeNum(totales.combPerdidoGal);
  const perdidaUSD = safeNum(economico.perdidaUSD_por_combustible);
  
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
      totalPerdidaUSD += perdidaUSD;
      
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
      const perdidaUSDFormat = perdidaUSD.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
      
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
  }
  
  // ============================================
  // 4. GENERAR FOOTER DE TABLA
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
        <td style="text-align:right; font-weight:700; color:#e53e3e;">$${totalPerdidaUSD.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
      </tr>
    </tfoot>
  ` : '';
  
  // ============================================
  // 5. GENERAR RESUMEN BAJO TABLA
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
  // 6. GENERAR RECUADRO EDUCATIVO (solo si hay exceso)
  // ============================================
  const combFormat = combPerdidoGal.toLocaleString('en-US', {maximumFractionDigits: 0});
  const perdidaFormat = perdidaUSD.toLocaleString('en-US', {maximumFractionDigits: 0});
  
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
  // 7. ENSAMBLAR HTML COMPLETO
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

/**
 * Genera la sección de Códigos de Diagnóstico (DTC)
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} metricas - Objeto con métricas calculadas del cliente
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @returns {String} HTML de la sección completa
 */
function generarDTC(equipos, metricas, periodo) {
  
  // ============================================
  // 1. FILTRAR EQUIPOS CON DTCs
  // ============================================
  const equiposConDTC = equipos.filter(eq => {
    const dtcs = eq.dtc || [];
    return dtcs.length > 0;
  });
  
  // Si no hay equipos con DTCs, mostrar mensaje positivo
  if (equiposConDTC.length === 0) {
    return generarMensajeNoDTC(periodo);
  }
  
  // ============================================
  // 2. PROCESAR Y CLASIFICAR DTCs
  // ============================================
  const equiposProcesados = equiposConDTC.map(eq => {
    const dtcs = eq.dtc || [];
    
    // Procesar cada DTC
    const dtcsProcesados = dtcs.map(dtc => {
      const { codigo, descripcionLimpia } = extraerCodigoYDescripcion(dtc.descripcion);
      return {
        codigo: codigo,
        descripcion: descripcionLimpia,
        repeticiones: safeInt(dtc.repeticiones),
        severidad: dtc.severidad || "Mediana"
      };
    });
    
    // Separar por severidad
    const criticos = dtcsProcesados.filter(d => d.severidad === "Alta");
    const atencion = dtcsProcesados.filter(d => d.severidad === "Mediana");
    
    // Ordenar por repeticiones (descendente)
    criticos.sort((a, b) => b.repeticiones - a.repeticiones);
    atencion.sort((a, b) => b.repeticiones - a.repeticiones);
    
    return {
      id_equipo: eq.id_equipo,
      modelo: eq.modelo,
      num_interno: eq.num_interno,
      familia: eq.familia,
      dtcsCriticos: criticos,
      dtcsAtencion: atencion,
      totalCriticos: criticos.length,
      totalAtencion: atencion.length,
      totalDTCs: dtcs.length
    };
  });
  
  // Separar equipos con críticos vs solo atención
  const equiposConCriticos = equiposProcesados.filter(eq => eq.totalCriticos > 0);
  const equiposSoloAtencion = equiposProcesados.filter(eq => eq.totalCriticos === 0 && eq.totalAtencion > 0);
  
  // Ordenar por cantidad de códigos críticos (descendente)
  equiposConCriticos.sort((a, b) => b.totalCriticos - a.totalCriticos);
  equiposSoloAtencion.sort((a, b) => b.totalAtencion - a.totalAtencion);
  
  // ============================================
  // 3. CALCULAR ESTADÍSTICAS PARA RESUMEN
  // ============================================
  const totalEquipos = equipos.length;
  const equiposAfectados = equiposConDTC.length;
  const pctAfectados = totalEquipos > 0 ? ((equiposAfectados / totalEquipos) * 100).toFixed(0) : 0;
  
  // Contar códigos por severidad
  let totalCriticos = 0;
  let totalAtencion = 0;
  equiposProcesados.forEach(eq => {
    totalCriticos += eq.totalCriticos;
    totalAtencion += eq.totalAtencion;
  });
  const totalEventos = totalCriticos + totalAtencion;
  const pctCriticos = totalEventos > 0 ? ((totalCriticos / totalEventos) * 100).toFixed(0) : 0;
  const pctAtencion = totalEventos > 0 ? ((totalAtencion / totalEventos) * 100).toFixed(0) : 0;
  
  // Agrupar por familia
  const porFamilia = agruparEquiposPorFamilia(equiposProcesados);
  
  // ============================================
  // 4. GENERAR RESUMEN EJECUTIVO
  // ============================================
  const resumenEjecutivo = generarResumenEjecutivoDTC(
    totalEquipos,
    equiposAfectados,
    pctAfectados,
    totalEventos,
    totalCriticos,
    totalAtencion,
    pctCriticos,
    pctAtencion,
    porFamilia
  );
  
  // ============================================
  // 5. GENERAR TARJETAS DE EQUIPOS CRÍTICOS
  // ============================================
  let tarjetasCriticos = '';
  if (equiposConCriticos.length > 0) {
    tarjetasCriticos = `
      <div class="dtc-section-header">
        <h3 class="dtc-section-title">🔴 EQUIPOS CON ALERTAS CRÍTICAS</h3>
      </div>
    `;
    
    equiposConCriticos.forEach(eq => {
      tarjetasCriticos += generarTarjetaEquipoDTC(eq, 'critico');
    });
  }
  
  // ============================================
  // 6. GENERAR TARJETAS DE EQUIPOS ATENCIÓN
  // ============================================
  let tarjetasAtencion = '';
  if (equiposSoloAtencion.length > 0) {
    tarjetasAtencion = `
      <div class="dtc-section-header">
        <h3 class="dtc-section-title">🟡 EQUIPOS CON ALERTAS DE ATENCIÓN</h3>
      </div>
    `;
    
    equiposSoloAtencion.forEach(eq => {
      tarjetasAtencion += generarTarjetaEquipoDTC(eq, 'atencion');
    });
  }
  
  // ============================================
  // 7. ENSAMBLAR HTML COMPLETO
  // ============================================
  return `
    <div class="page page-dtc">
      
      <!-- Header de sección -->
      <div class="section-header">
        <h2>CÓDIGOS DE DIAGNÓSTICO (DTC)</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <!-- Periodo -->
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- Resumen Ejecutivo -->
      ${resumenEjecutivo}
      
      <!-- Equipos con alertas críticas -->
      ${tarjetasCriticos}
      
      <!-- Equipos con alertas de atención -->
      ${tarjetasAtencion}
      
    </div>
  `;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Extrae el código DTC y la descripción limpia
 */
/**
 * Extrae el código DTC y la descripción limpia
 * Soporta múltiples formatos:
 * - XXXX-XXX Descripción
 * - ECU XXXXXX.XX: Descripción
 * - TCU XXXXXX.XX: Descripción
 * - Cualquier formato: Descripción
 */
function extraerCodigoYDescripcion(descripcionCompleta) {
  if (!descripcionCompleta) {
    return { codigo: "N/A", descripcionLimpia: "" };
  }
  
  let codigo = "";
  let descripcionLimpia = descripcionCompleta;
  
  // Estrategia 1: Buscar todo lo que está antes de ":"
  if (descripcionCompleta.includes(":")) {
    const partes = descripcionCompleta.split(":");
    codigo = partes[0].trim();
    descripcionLimpia = partes.slice(1).join(":").trim();
  }
  // Estrategia 2: Si no hay ":", buscar patrón XXXX-XXX al inicio
  else {
    const match = descripcionCompleta.match(/^(\d{4}-\d{3})/);
    if (match) {
      codigo = match[1];
      descripcionLimpia = descripcionCompleta.replace(/^\d{4}-\d{3}\s*/, "").trim();
    } else {
      // Estrategia 3: Tomar las primeras 2-3 palabras como código
      const palabras = descripcionCompleta.split(" ");
      if (palabras.length >= 2) {
        codigo = palabras.slice(0, 2).join(" ");
        descripcionLimpia = palabras.slice(2).join(" ");
      } else {
        codigo = "GENERAL";
        descripcionLimpia = descripcionCompleta;
      }
    }
  }
  
  // Truncar descripción si es muy larga (60 caracteres)
  if (descripcionLimpia.length > 250) {
    descripcionLimpia = descripcionLimpia.substring(0, 247) + "...";
  }
  
  return { codigo, descripcionLimpia };
}

/**
 * Agrupa equipos por familia y cuenta DTCs
 */
function agruparEquiposPorFamilia(equiposProcesados) {
  const familias = {};
  
  equiposProcesados.forEach(eq => {
    const familia = eq.familia || "OTROS";
    
    if (!familias[familia]) {
      familias[familia] = {
        nombre: familia,
        equipos: 0,
        criticos: 0,
        atencion: 0
      };
    }
    
    familias[familia].equipos++;
    familias[familia].criticos += eq.totalCriticos;
    familias[familia].atencion += eq.totalAtencion;
  });
  
  // Convertir a array y ordenar por cantidad de equipos
  return Object.values(familias).sort((a, b) => b.equipos - a.equipos);
}


/**
 * Genera el HTML del resumen mejorado con barras apiladas
 */
function generarResumenEjecutivoDTC(totalEquipos, equiposAfectados, pctAfectados, 
                                     totalEventos, totalCriticos, totalAtencion,
                                     pctCriticos, pctAtencion, porFamilia) {
  
  // Generar gráfico de familias con barras apiladas
  let graficoFamilias = '';
  
  porFamilia.forEach(fam => {
    const totalCodigosFamilia = fam.criticos + fam.atencion;
    const pctCriticos = totalCodigosFamilia > 0 ? (fam.criticos / totalCodigosFamilia) * 100 : 0;
    const pctAtencion = totalCodigosFamilia > 0 ? (fam.atencion / totalCodigosFamilia) * 100 : 0;
    
    graficoFamilias += `
      <div class="familia-row-visual">
        <div class="familia-info">
          <div class="familia-nombre-visual">${fam.nombre}</div>
          <div class="familia-numeros">${fam.equipos} equipo${fam.equipos > 1 ? 's' : ''}</div>
        </div>
        <div class="familia-barra-visual">
          <div class="barra-container-visual">
            ${fam.criticos > 0 ? `
              <div class="barra-segmento critico" 
                   style="width: ${pctCriticos}%;" 
                   title="${fam.criticos} crítico${fam.criticos > 1 ? 's' : ''}">
                ${fam.criticos > 0 ? fam.criticos : ''}
              </div>
            ` : ''}
            ${fam.atencion > 0 ? `
              <div class="barra-segmento atencion" 
                   style="width: ${pctAtencion}%;"
                   title="${fam.atencion} atención">
                ${fam.atencion > 0 ? fam.atencion : ''}
              </div>
            ` : ''}
          </div>
          <div class="barra-leyenda">
            ${fam.criticos > 0 ? `<span class="leyenda-critico">Críticos: ${fam.criticos}</span>` : ''}
            ${fam.atencion > 0 ? `<span class="leyenda-atencion">Atención: ${fam.atencion}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  });
  
  return `
    <div class="resumen-box-mejorado">
      
      <!-- Header -->
      <div class="resumen-header">
        <h3 class="resumen-title-mejorado">ESTADO GENERAL DE LA FLOTA</h3>
      </div>
      
      <!-- Stats principales -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Equipos</div>
          <div class="stat-value-big">${totalEquipos}</div>
        </div>
        <div class="stat-card highlight">
          <div class="stat-label">Equipos con alertas</div>
          <div class="stat-value-big">${equiposAfectados} <span class="stat-percent">(${pctAfectados}%)</span></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total de códigos</div>
          <div class="stat-value-big">${totalEventos}</div>
        </div>
      </div>
      
      <div class="resumen-divider-mejorado"></div>
      
      <!-- Distribución por familia con barras apiladas -->
      <div class="seccion-familias">
        <h4 class="seccion-title">DISTRIBUCIÓN POR FAMILIA</h4>
        <div class="familias-grafico">
          ${graficoFamilias}
        </div>
      </div>
      
      <div class="resumen-divider-mejorado"></div>
      
      <!-- Nivel de prioridad con barras -->
      <div class="seccion-prioridad">
        <h4 class="seccion-title">NIVEL DE PRIORIDAD</h4>
        
        <div class="prioridad-item">
          <div class="prioridad-header">
            <span class="prioridad-label critico">Alta prioridad</span>
            <span class="prioridad-value">${totalCriticos} código${totalCriticos !== 1 ? 's' : ''} (${pctCriticos}%)</span>
          </div>
          <div class="prioridad-bar-container">
            <div class="prioridad-bar critico" style="width: ${pctCriticos}%;"></div>
          </div>
        </div>
        
        <div class="prioridad-item">
          <div class="prioridad-header">
            <span class="prioridad-label atencion">Mediana prioridad</span>
            <span class="prioridad-value">${totalAtencion} código${totalAtencion !== 1 ? 's' : ''} (${pctAtencion}%)</span>
          </div>
          <div class="prioridad-bar-container">
            <div class="prioridad-bar atencion" style="width: ${pctAtencion}%;"></div>
          </div>
        </div>
        
      </div>
      
    </div>
  `;
}

/**
 * Genera la tarjeta HTML de un equipo con sus DTCs
 */
function generarTarjetaEquipoDTC(equipo, tipo) {
  const claseTarjeta = tipo === 'critico' ? 'dtc-card-critico' : 'dtc-card-atencion';
  
  // Header de la tarjeta
  let htmlTarjeta = `
    <div class="${claseTarjeta}">
      <div class="dtc-card-header">
        <h4 class="dtc-card-title">${equipo.familia} ${equipo.modelo} - ${equipo.num_interno}</h4>
        <div class="dtc-card-info">
          <span class="dtc-card-serie">Serie: ${equipo.id_equipo}</span>
          <span class="dtc-card-count">
            ${equipo.totalDTCs} código${equipo.totalDTCs > 1 ? 's' : ''} activo${equipo.totalDTCs > 1 ? 's' : ''}
            ${equipo.totalCriticos > 0 ? `(${equipo.totalCriticos} crítico${equipo.totalCriticos > 1 ? 's' : ''})` : ''}
          </span>
        </div>
      </div>
  `;
  
  // Sección de códigos críticos
  if (equipo.totalCriticos > 0) {
    htmlTarjeta += generarTablaDTCs(equipo.dtcsCriticos, 'critico', equipo.totalCriticos);
  }
  
  // Sección de códigos de atención (si es un equipo mixto)
  if (tipo === 'critico' && equipo.totalAtencion > 0) {
    htmlTarjeta += `
      <div class="dtc-subsection">
        <h5 class="dtc-subsection-title">🟡 CÓDIGOS DE PRIORIDAD MEDIANA (${equipo.totalAtencion})</h5>
      </div>
    `;
    htmlTarjeta += generarTablaDTCs(equipo.dtcsAtencion, 'atencion', equipo.totalAtencion);
  }
  
  // Sección de códigos de atención (si es equipo solo atención)
  if (tipo === 'atencion' && equipo.totalAtencion > 0) {
    htmlTarjeta += generarTablaDTCs(equipo.dtcsAtencion, 'atencion', equipo.totalAtencion);
  }
  
  htmlTarjeta += `</div>`;
  
  return htmlTarjeta;
}

/**
 * Genera la tabla de DTCs (con límite de 10)
 */
function generarTablaDTCs(dtcs, tipo, totalCodigos) {
  const LIMITE = 10;
  const mostrarTodos = totalCodigos <= LIMITE;
  const dtcsMostrar = mostrarTodos ? dtcs : dtcs.slice(0, LIMITE);
  const codigosOcultos = totalCodigos - LIMITE;
  
  let htmlTabla = `
    <table class="dtc-table">
      <thead>
        <tr>
          <th style="width:12%;">Código</th>
          <th style="width:68%;">Descripción</th>
          <th style="width:12%;">Frecuencia</th>
          <th style="width:8%;">Severidad</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  dtcsMostrar.forEach(dtc => {
    const colorSeveridad = dtc.severidad === "Alta" ? "#c53030" : "#d69e2e";
    const letraSeveridad = dtc.severidad === "Alta" ? "A" : "M";
    
    htmlTabla += `
      <tr>
        <td style="font-weight:600;">${dtc.codigo}</td>
        <td>${dtc.descripcion}</td>
        <td style="text-align:center;">${dtc.repeticiones}</td>
        <td style="text-align:center; font-weight:700; color:${colorSeveridad};">${letraSeveridad}</td>
      </tr>
    `;
  });
  
  htmlTabla += `
      </tbody>
    </table>
  `;
  
  // Mensaje de códigos adicionales
  if (!mostrarTodos && codigosOcultos > 0) {
    htmlTabla += `
      <div class="dtc-additional">
        + ${codigosOcultos} código${codigosOcultos > 1 ? 's' : ''} adicional${codigosOcultos > 1 ? 'es' : ''} con menor frecuencia
      </div>
    `;
  }
  
  return htmlTabla;
}


/**
 * Genera mensaje educativo cuando no hay DTCs
 */
function generarMensajeNoDTC(periodo) {
  return `
    <div class="page page-dtc">
      
      <div class="section-header">
        <h2>CÓDIGOS DE DIAGNÓSTICO (DTC)</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- Recuadro educativo -->
      <div class="dtc-info-box">
        <h4 class="dtc-info-title">🔧¿Sabía que las máquinas John Deere cuentan con un sistema de autodiagnóstico que comunica fallas en
                                  tiempo real?</h4>
        <p class="dtc-info-text">
          Los Códigos DTC (Diagnostic Trouble Codes) son códigos de diagnóstico que comunican 
          fallas eléctricas y electrónicas en tiempo real, permitiendo identificar con precisión 
          los sistemas o componentes de la máquina que presentan anomalías. Este sistema facilita 
          una respuesta técnica rápida, lo que contribuye a reducir significativamente los tiempos 
          de inactividad.
        </p>
      </div>
      
      <!-- Mensaje de estado positivo -->
      <div class="dtc-status-positive">
        <div class="status-icon-large">✓</div>
        <h3 class="status-title">Estado Óptimo de la Flota</h3>
        <p class="status-message">
          No se han generado códigos de diagnóstico en este periodo.
        </p>
        <p class="status-description">
          Su flota está operando sin alertas del sistema de diagnóstico, lo que indica:
        </p>
        <ul class="status-benefits">
          <li>Buen estado de mantenimiento preventivo</li>
          <li>Sistemas operando dentro de parámetros normales</li>
          <li>Menor riesgo de paradas inesperadas</li>
          <li>Reducción de costos operativos por reparaciones correctivas</li>
        </ul>
      </div>
    </div>
  `;
}


/**
 * ============================================
 * SECCIÓN: ACEITE
 * ============================================
 */

/**
 * Genera la sección completa de Análisis de Fluidos
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @param {String} imagenBase64 - Imagen promocional ALS en base64
 * @returns {String} HTML de la sección completa
 */
function generarAnalisisFluidos(equipos, periodo, imagenBase64) {
  
  // ============================================
  // 1. FILTRAR EQUIPOS CON ANÁLISIS DE FLUIDOS
  // ============================================
  const equiposConAnalisis = equipos.filter(eq => {
    const analisis = eq.ac || [];
    return analisis.length > 0;
  });
  
  // Si no hay análisis, mostrar mensaje promocional
  if (equiposConAnalisis.length === 0) {
    return generarMensajeSinAnalisis(periodo, imagenBase64);
  }
  
  // ============================================
  // 2. PROCESAR Y CLASIFICAR ANÁLISIS
  // ============================================
  const muestrasAnormales = [];
  const muestrasPrecaucion = [];
  const muestrasNormales = [];
  
  equiposConAnalisis.forEach(eq => {
    const analisis = eq.ac || [];
    
    analisis.forEach(muestra => {
      const muestraConEquipo = {
        familia: eq.familia || "SIN CLASIFICAR",
        modelo: eq.modelo || "-",
        num_interno: eq.num_interno || "-",
        id_equipo: eq.id_equipo,
        compartimiento: muestra.compartimiento || "-",
        muestra: muestra.muestra || "-",
        resultado: muestra.resultado || "Normal",
        pdf: muestra.pdf || "#",
        tipo: muestra.tipo || "Aceite"
      };
      
      // Clasificar por resultado
      if (muestra.resultado === "Anormal") {
        muestrasAnormales.push(muestraConEquipo);
      } else if (muestra.resultado === "Precaución") {
        muestrasPrecaucion.push(muestraConEquipo);
      } else {
        muestrasNormales.push(muestraConEquipo);
      }
    });
  });
  
  // ============================================
  // 3. CALCULAR ESTADÍSTICAS
  // ============================================
  const totalMuestras = muestrasAnormales.length + muestrasPrecaucion.length + muestrasNormales.length;
  const totalEquipos = equipos.length;
  const equiposAnalizados = equiposConAnalisis.length;
  
  const pctAnormal = totalMuestras > 0 ? ((muestrasAnormales.length / totalMuestras) * 100).toFixed(0) : 0;
  const pctPrecaucion = totalMuestras > 0 ? ((muestrasPrecaucion.length / totalMuestras) * 100).toFixed(0) : 0;
  const pctNormal = totalMuestras > 0 ? ((muestrasNormales.length / totalMuestras) * 100).toFixed(0) : 0;
  
  // ============================================
  // 4. GENERAR RESUMEN
  // ============================================
  const resumen = generarResumenAnalisis(
    totalMuestras,
    equiposAnalizados,
    totalEquipos,
    muestrasAnormales.length,
    muestrasPrecaucion.length,
    muestrasNormales.length,
    pctAnormal,
    pctPrecaucion,
    pctNormal
  );
  
  // ============================================
  // 5. GENERAR SECCIONES
  // ============================================
  let seccionAnormales = '';
  if (muestrasAnormales.length > 0) {
    seccionAnormales = generarSeccionAnormales(muestrasAnormales);
  }
  
  let seccionPrecaucion = '';
  if (muestrasPrecaucion.length > 0) {
    seccionPrecaucion = generarSeccionPrecaucion(muestrasPrecaucion);
  }
  
  let seccionNormales = '';
  if (muestrasNormales.length > 0) {
    seccionNormales = generarSeccionNormales(muestrasNormales);
  }
  
  // ============================================
  // 6. ENSAMBLAR HTML COMPLETO
  // ============================================
  return `
    <div class="page page-fluidos">
      
      <!-- Header de sección -->
      <div class="section-header">
        <h2>ANÁLISIS DE FLUIDOS</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <!-- Periodo -->
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- Resumen -->
      ${resumen}
      
      <!-- Anormales -->
      ${seccionAnormales}
      
      <!-- Precaución -->
      ${seccionPrecaucion}
      
      <!-- Normales -->
      ${seccionNormales}
      
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

// SECCION EXPERT ALERT


// ============================================
// SECCIÓN: EXPERT ALERTS (EA)
// ============================================

/**
 * Genera la sección completa de Expert Alerts
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @returns {String} HTML de la sección completa
 */
function generarEventosAlerta(equipos, periodo) {
  
  // ============================================
  // 1. FILTRAR EQUIPOS CON EXPERT ALERTS
  // ============================================
  const equiposConAlertas = equipos.filter(eq => {
    const alertas = eq.ea || [];
    return alertas.length > 0;
  });
  
  // Recuadro educativo siempre se muestra
  const recuadroEducativo = generarRecuadroEducativoEA();
  
  // Si no hay alertas, mostrar mensaje positivo
  if (equiposConAlertas.length === 0) {
    return generarMensajeSinAlertasEA(periodo, recuadroEducativo);
  }
  
  // ============================================
  // 2. CLASIFICAR EQUIPOS POR SEVERIDAD MÁXIMA
  // ============================================
  const clasificados = clasificarEquiposPorSeveridadMaxima(equiposConAlertas);
  
  // ============================================
  // 3. CALCULAR ESTADÍSTICAS PARA RESUMEN
  // ============================================
  let totalCriticas = 0;
  let totalAltas = 0;
  let totalRendimiento = 0;
  
  equiposConAlertas.forEach(eq => {
    const alertas = eq.ea || [];
    alertas.forEach(alerta => {
      if (alerta.severidad === 'Crítica') {
        totalCriticas++;
      } else if (alerta.severidad === 'Alta') {
        totalAltas++;
      } else if (alerta.severidad === 'Alta-Rendimiento') {
        totalRendimiento++;
      }
    });
  });
  
  const totalAlertas = totalCriticas + totalAltas + totalRendimiento;
  const totalEquipos = equipos.length;
  const equiposAfectados = equiposConAlertas.length;
  
  const pctCriticas = totalAlertas > 0 ? ((totalCriticas / totalAlertas) * 100).toFixed(0) : 0;
  const pctAltas = totalAlertas > 0 ? ((totalAltas / totalAlertas) * 100).toFixed(0) : 0;
  const pctRendimiento = totalAlertas > 0 ? ((totalRendimiento / totalAlertas) * 100).toFixed(0) : 0;
  
  // ============================================
  // 4. GENERAR RESUMEN EJECUTIVO
  // ============================================
  const resumen = generarResumenEjecutivoEA({
    totalAlertas,
    totalCriticas,
    totalAltas,
    totalRendimiento,
    pctCriticas,
    pctAltas,
    pctRendimiento,
    totalEquipos,
    equiposAfectados
  });
  
  // ============================================
  // 5. GENERAR SECCIONES POR SEVERIDAD
  // ============================================
  let seccionCriticas = '';
  if (clasificados.criticas.length > 0) {
    seccionCriticas = `
      <div class="ea-section-header">
        <h3 class="ea-section-title">🔴 ALERTAS CRÍTICAS (${clasificados.criticas.length} ${clasificados.criticas.length === 1 ? 'equipo' : 'equipos'})</h3>
      </div>
    `;
    
    clasificados.criticas.forEach(equipo => {
      seccionCriticas += generarTarjetaEquipoEA(equipo);
    });
  }
  
  let seccionAltas = '';
  if (clasificados.altas.length > 0) {
    seccionAltas = `
      <div class="ea-section-header">
        <h3 class="ea-section-title">🟠 ALERTAS DE ALTA PRIORIDAD (${clasificados.altas.length} ${clasificados.altas.length === 1 ? 'equipo' : 'equipos'})</h3>
      </div>
    `;
    
    clasificados.altas.forEach(equipo => {
      seccionAltas += generarTarjetaEquipoEA(equipo);
    });
  }
  
  let seccionRendimiento = '';
  if (clasificados.rendimiento.length > 0) {
    seccionRendimiento = `
      <div class="ea-section-header">
        <h3 class="ea-section-title">🟡 ALERTAS DE ALTA-RENDIMIENTO (${clasificados.rendimiento.length} ${clasificados.rendimiento.length === 1 ? 'equipo' : 'equipos'})</h3>
      </div>
    `;
    
    clasificados.rendimiento.forEach(equipo => {
      seccionRendimiento += generarTarjetaEquipoEA(equipo);
    });
  }
  
  // ============================================
  // 6. ENSAMBLAR HTML COMPLETO
  // ============================================
  return `
    <div class="page page-ea">
      
      <!-- Header de sección -->
      <div class="section-header">
        <h2>EXPERT ALERTS</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>
      
      <!-- Periodo -->
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>
      
      <!-- Recuadro educativo -->
      ${recuadroEducativo}
      
      <!-- Resumen ejecutivo -->
      ${resumen}
      
      <!-- Sección Críticas -->
      ${seccionCriticas}
      
      <!-- Sección Altas -->
      ${seccionAltas}
      
      <!-- Sección Rendimiento -->
      ${seccionRendimiento}
      
    </div>
  `;
}

// ============================================
// FUNCIONES AUXILIARES DE EXPERT ALERTS
// ============================================

/**
 * Genera el recuadro educativo de Expert Alerts
 */
function generarRecuadroEducativoEA() {
  return `
    <div class="ea-info-box">
      <h4 class="ea-info-title">
        📊 ¿Es posible anticiparse a una falla antes de que ocurra? Con John Deere, sí.
      </h4>
      <p class="ea-info-text">
        Las <strong>Expert Alerts</strong> de John Deere son notificaciones inteligentes 
        desarrolladas para advertir, de forma proactiva, sobre condiciones que podrían 
        derivar en fallas futuras. Estas alertas se generan mediante el análisis continuo 
        de datos operativos y el respaldo de conocimiento técnico especializado. Al recibir 
        una Expert Alert, los operadores y responsables de mantenimiento pueden intervenir 
        antes de que el problema se manifieste, extendiendo la vida útil de los equipos.
      </p>
    </div>
  `;
}

/**
 * Genera el resumen ejecutivo de Expert Alerts con estadísticas
 */
function generarResumenEjecutivoEA(stats) {
  
  const {
    totalAlertas,
    totalCriticas,
    totalAltas,
    totalRendimiento,
    pctCriticas,
    pctAltas,
    pctRendimiento,
    totalEquipos,
    equiposAfectados
  } = stats;
  
  const pctEquiposAfectados = totalEquipos > 0 
    ? ((equiposAfectados / totalEquipos) * 100).toFixed(0) 
    : 0;
  
  return `
    <div class="ea-resumen">
      <h3 class="ea-resumen-titulo">📊 RESUMEN DE ALERTAS</h3>
      
      <!-- Barras de progreso por severidad -->
      <div class="ea-barras-container">
        
        <!-- Críticas -->
        <div class="ea-barra-grupo">
          <div class="ea-barra-header">
            <span class="ea-barra-label">CRÍTICAS</span>
            <span class="ea-barra-valor">🔴 ${totalCriticas}</span>
          </div>
          <div class="ea-barra-bg">
            <div class="ea-barra-fill critica" style="width: ${pctCriticas}%"></div>
          </div>
          <div class="ea-barra-pct">${pctCriticas}%</div>
        </div>
        
        <!-- Altas -->
        <div class="ea-barra-grupo">
          <div class="ea-barra-header">
            <span class="ea-barra-label">ALTAS</span>
            <span class="ea-barra-valor">🟠 ${totalAltas}</span>
          </div>
          <div class="ea-barra-bg">
            <div class="ea-barra-fill alta" style="width: ${pctAltas}%"></div>
          </div>
          <div class="ea-barra-pct">${pctAltas}%</div>
        </div>
        
        <!-- Alta-Rendimiento -->
        <div class="ea-barra-grupo">
          <div class="ea-barra-header">
            <span class="ea-barra-label">ALTA-RENDIMIENTO</span>
            <span class="ea-barra-valor">🟡 ${totalRendimiento}</span>
          </div>
          <div class="ea-barra-bg">
            <div class="ea-barra-fill rendimiento" style="width: ${pctRendimiento}%"></div>
          </div>
          <div class="ea-barra-pct">${pctRendimiento}%</div>
        </div>
        
      </div>
      
      <!-- Leyenda -->
      <div class="ea-leyenda">
        <h4 class="leyenda-titulo">Leyenda:</h4>
        <div class="leyenda-item">
          <span class="leyenda-icon">🔴</span>
          <span class="leyenda-text">
            <strong>Crítica:</strong> Intervención necesaria. El asesor designado se comunicará con usted.
          </span>
        </div>
        <div class="leyenda-item">
          <span class="leyenda-icon">🟠</span>
          <span class="leyenda-text">
            <strong>Alta:</strong> Requiere monitoreo adicional y seguimiento continuo.
          </span>
        </div>
        <div class="leyenda-item">
          <span class="leyenda-icon">🟡</span>
          <span class="leyenda-text">
            <strong>Alta-Rendimiento:</strong> Afecta eficiencia operativa.
          </span>
        </div>
      </div>
      
      <!-- Estadísticas -->
      <div class="ea-stats">
        <div class="ea-stat-item">
          <span class="stat-bullet">•</span>
          <span class="stat-text">Total de alertas: <strong>${totalAlertas}</strong></span>
        </div>
        <div class="ea-stat-item">
          <span class="stat-bullet">•</span>
          <span class="stat-text">Equipos afectados: <strong>${equiposAfectados} de ${totalEquipos} (${pctEquiposAfectados}%)</strong></span>
        </div>
      </div>
      
    </div>
  `;
}

/**
 * Genera una tarjeta individual de equipo con todas sus alertas
 */
function generarTarjetaEquipoEA(equipo) {
  
  const alertas = equipo.ea || [];
  
  // Clasificar alertas por severidad
  const criticas = alertas.filter(a => a.severidad === 'Crítica');
  const altas = alertas.filter(a => a.severidad === 'Alta');
  const rendimiento = alertas.filter(a => a.severidad === 'Alta-Rendimiento');
  
  // Ordenar cada grupo por fecha (más reciente primero)
  const ordenarPorFecha = (a, b) => {
    const fechaA = a.fecha ? new Date(a.fecha) : new Date(0);
    const fechaB = b.fecha ? new Date(b.fecha) : new Date(0);
    return fechaB - fechaA; // Descendente
  };
  
  criticas.sort(ordenarPorFecha);
  altas.sort(ordenarPorFecha);
  rendimiento.sort(ordenarPorFecha);
  
  const totalAlertas = alertas.length;
  
  // Generar contador con iconos
  let contadorTexto = `${totalAlertas} ${totalAlertas === 1 ? 'alerta' : 'alertas'}`;
  
  const partes = [];
  if (criticas.length > 0) partes.push(`🔴 ${criticas.length} ${criticas.length === 1 ? 'crítica' : 'críticas'}`);
  if (altas.length > 0) partes.push(`🟠 ${altas.length} ${altas.length === 1 ? 'alta' : 'altas'}`);
  if (rendimiento.length > 0) partes.push(`🟡 ${rendimiento.length} ${rendimiento.length === 1 ? 'rend.' : 'rend.'}`);
  
  contadorTexto += ` (${partes.join(', ')})`;
  
  // Generar listas de alertas por severidad
  let listasCriticas = '';
  if (criticas.length > 0) {
    listasCriticas = generarListaAlertasPorSeveridad(criticas, 'Crítica');
  }
  
  let listasAltas = '';
  if (altas.length > 0) {
    listasAltas = generarListaAlertasPorSeveridad(altas, 'Alta');
  }
  
  let listasRendimiento = '';
  if (rendimiento.length > 0) {
    listasRendimiento = generarListaAlertasPorSeveridad(rendimiento, 'Alta-Rendimiento');
  }
  
  return `
    <div class="ea-tarjeta">
      
      <!-- Encabezado del equipo -->
      <div class="ea-tarjeta-header">
        <h4 class="ea-equipo-titulo">
          ${equipo.familia || 'SIN CLASIFICAR'} - ${equipo.modelo || '-'} - ${equipo.num_interno || '-'}
        </h4>
      </div>
      
      <!-- Contador de alertas -->
      <div class="ea-contador">
        <span class="contador-icon">📊</span>
        <span class="contador-text">Total: ${contadorTexto}</span>
      </div>
      
      <!-- Alertas críticas -->
      ${listasCriticas}
      
      <!-- Alertas altas -->
      ${listasAltas}
      
      <!-- Alertas rendimiento -->
      ${listasRendimiento}
      
    </div>
  `;
}

/**
 * Genera una lista de alertas de una severidad específica
 */

function generarListaAlertasPorSeveridad(alertas, severidad) {
  
  let titulo = '';
  let icono = '';
  
  if (severidad === 'Crítica') {
    titulo = 'ALERTAS CRÍTICAS';
    icono = '🔴';
  } else if (severidad === 'Alta') {
    titulo = 'ALERTAS ALTAS';
    icono = '🟠';
  } else if (severidad === 'Alta-Rendimiento') {
    titulo = 'ALERTAS ALTA-RENDIMIENTO';
    icono = '🟡';
  }
  
  let html = `
    <div class="ea-lista-seccion">
      <h5 class="ea-lista-titulo">${icono} ${titulo}</h5>
  `;
  
  alertas.forEach(alerta => {
    const descripcion = alerta.descripcion || 'Descripción no disponible';
    const estado = alerta.estado || '-';
    const fecha = alerta.fecha ? formatearFechaEA(alerta.fecha) : '-';
    
    html += `
      <div class="ea-alerta-item">
        <div class="alerta-descripcion">• ${descripcion}</div>
        <div class="alerta-meta">Estado: ${estado} | Fecha: ${fecha}</div>
      </div>
    `;
  });
  
  html += `
    </div>
  `;
  
  return html;
}

/**
 * Genera el mensaje cuando no hay Expert Alerts
 */
function generarMensajeSinAlertasEA(periodo, recuadroEducativo) {
  return `
    <div class="page page-ea">

      <!-- Header de sección -->
      <div class="section-header">
        <h2>EXPERT ALERTS</h2>
        <a href="#contenido" class="btn-volver">🔼 Volver al Contenido</a>
      </div>

      <!-- Periodo -->
      <p class="periodo-text">
        Periodo: del <strong>${periodo.inicio}</strong> al <strong>${periodo.fin}</strong>
      </p>

      <!-- Recuadro educativo -->
      ${recuadroEducativo}

      <!-- Mensaje de estado positivo -->
      <div class="ea-status-positive">
        <h3 class="status-title">Estado Óptimo de la Flota</h3>
        <p class="status-message">
          No se generaron Expert Alerts en este periodo.
        </p>
        <ul class="status-benefits">
          <li>Operación dentro de parámetros normales</li>
          <li>Bajo riesgo de fallas inesperadas</li>
          <li>Reducción de tiempos de inactividad</li>
        </ul>
      </div>

    </div>
  `;
}

/**
 * Clasifica equipos por su severidad máxima
 * Cada equipo aparece una sola vez en la sección de su alerta más crítica
 */
function clasificarEquiposPorSeveridadMaxima(equipos) {
  
  const criticas = [];
  const altas = [];
  const rendimiento = [];
  
  equipos.forEach(eq => {
    const alertas = eq.ea || [];
    
    // Verificar si tiene alertas críticas
    const tieneCriticas = alertas.some(a => a.severidad === 'Crítica');
    if (tieneCriticas) {
      criticas.push(eq);
      return;
    }
    
    // Si no tiene críticas, verificar si tiene altas
    const tieneAltas = alertas.some(a => a.severidad === 'Alta');
    if (tieneAltas) {
      altas.push(eq);
      return;
    }
    
    // Si solo tiene rendimiento
    const tieneRendimiento = alertas.some(a => a.severidad === 'Alta-Rendimiento');
    if (tieneRendimiento) {
      rendimiento.push(eq);
    }
  });
  
  return {
    criticas,
    altas,
    rendimiento
  };
}

/**
 * Formatea una fecha para Expert Alerts
 * @param {String|Date} fecha - Fecha en formato ISO o Date object
 * @returns {String} Fecha formateada como "21-Feb-2025"
 */
function formatearFechaEA(fecha) {
  if (!fecha) return '-';
  
  try {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                   'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();
    
    return `${dia}-${mes}-${anio}`;
  } catch (error) {
    return '-';
  }
}



/**
 * Genera la sección de Contactos (última página del reporte)
 * @param {Object} cliente - Objeto del cliente con datos de contacto
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
        <td colspan="4" style="text-align:center; padding:30px; color:#718096; font-size:16px;">
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
    <div class="page page-contactos">

      <!-- Header de sección -->
      <div class="section-header" style="justify-content:center; border-bottom:none;">
        <h2 style="color:#ed8936; text-align:center; margin:0;">CERCA DE LOS CLIENTES</h2>
      </div>

      <!-- TABLA DE CONTACTOS DEL CLIENTE -->
      <div class="table-section">
        <h3 class="table-title">Contactos con el Cliente:</h3>

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
        <h3 class="contacto-ipesa-title">CONTACTOS IPESA</h3>
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



/**
 * ============================================================================
 * RESUMEN EJECUTIVO - SECCIÓN COMPLETA (2 PÁGINAS)
 * ============================================================================
 * Este archivo contiene la función principal y helpers para generar
 * el Resumen Ejecutivo de Flota.
 *
 * Dependencias: graficos.js (para renderGraficosResumen y buildRecomendaciones)
 * ============================================================================
 */

// NOTA: Los estilos CSS ahora están centralizados en pdf-styles.js
// y se inyectan globalmente en el <head> del HTML por pdf-builder.js



/**
 * =================================================================
 * FUNCIÓN PRINCIPAL - Genera el Resumen Ejecutivo completo (2 páginas)
 * =================================================================
 */
function generarResumenEjecutivo(cliente, metricas, periodo) {

  // 1. Generar visualizaciones usando graficos.js
  const data = renderGraficosResumen(metricas);
  const recomendacionesHTML = buildRecomendaciones(metricas);

  // 2. Generar contenido de ambas páginas
  const pagina1HTML = generarPagina1DashboardResumen(metricas, data);
  const pagina2HTML = generarPagina2RecomendacionesResumen(recomendacionesHTML);

  // 3. Ensamblar HTML completo (los estilos CSS están en pdf-styles.js)
  return `
    <div class="page page-resumen-1">
      ${pagina1HTML}
      <div class="page-number">Página 1 de 2</div>
    </div>
    <div class="page page-resumen-2">
      ${pagina2HTML}
      <div class="page-number">Página 2 de 2</div>
    </div>
  `;
}


/**
 * =================================================================
 * PÁGINA 1 - DASHBOARD COMPLETO
 * =================================================================
 */
function generarPagina1DashboardResumen(metricas, data) {
  return `
    ${generarHeaderResumen('Monitoreo y Control de Maquinaria')}
    ${generarKPIBarResumen(metricas)}
    ${generarIndicadoresClaveResumen(metricas, data)}
    ${generarAlertasYEconomicoResumen(metricas, data)}
  `;
}


/**
 * =================================================================
 * PÁGINA 2 - RECOMENDACIONES
 * =================================================================
 */
function generarPagina2RecomendacionesResumen(recomendacionesHTML) {
  return `
    ${generarHeaderResumen('Recomendaciones y Plan de Acción')}
    <div class="section">
      <div class="section-header">
        <span class="section-icon">💡</span>
        Recomendaciones Prioritarias
      </div>
      <div class="recommendations">
        <div class="recommendation-title">🎯 Acciones Inmediatas Sugeridas</div>
        <ul class="recommendation-list">
          ${recomendacionesHTML}
        </ul>
      </div>
    </div>
  `;
}


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


/**
 * Genera las 2 páginas de portada (Principal + Imagen Institucional)
 * @param {Object} cliente - Objeto con {razon_social, nif}
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @param {Object} logos - {fleetAssurance, logoCSC, logoIpesa, imagenInstitucional}
 * @returns {String} HTML de las 2 páginas de portada
 */
function generarPortada(cliente, periodo, logos) {
  const razonSocial = cliente.razon_social || 'N/A';

  // Página 1: Portada Principal - Usando tabla HTML para compatibilidad PDF
  const pagina1 = `
    <div class="page-portada portada-1" style="position:relative;">
      <table class="portada-header" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td class="portada-left-image">
            <img src="data:image/png;base64,${logos.fleetAssurance}" style="width:100%; height:210mm; display:block;" alt="Fleet Assurance" />
          </td>
          <td class="portada-content">
            <h1>Reporte de Gestión de Flota</h1>
            <p class="csc-label">CSC</p>
            <p class="cliente-info">${razonSocial}</p>
            <p class="periodo-label">Periodo:</p>
            <p class="periodo-dates">del ${periodo.inicio} al ${periodo.fin}</p>
          </td>
        </tr>
      </table>

      <img src="data:image/png;base64,${logos.logoCSC}" style="position:absolute; top:20px; right:20px; width:200px; z-index:10;" alt="Logo CSC" />
      <img src="data:image/png;base64,${logos.logoIpesa}" style="position:absolute; bottom:20px; right:20px; width:200px; z-index:10;" alt="Logo IPESA" />
    </div>
  `;

  // Página 2: Imagen Institucional
  const pagina2 = `
    <div class="page-portada portada-2">
      <div class="portada-institucional">
        <img src="data:image/png;base64,${logos.imagenInstitucional}" class="imagen-institucional-full" alt="IPESA Institucional" />
      </div>
    </div>
  `;

  return pagina1 + pagina2;
}

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







