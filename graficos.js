/**
 * Gauge circular (un solo porcentaje) – estética de tu plantilla
 * - color: usa colorFor('critical'|'warning'|'success'|'info') o un hex
 * - subtitle: texto pequeño bajo el % (ej. "3 de 6" o "69.8/321.2h")
 */
function gaugeCircular({ percent = 0, color = '#38a169', subtitle = '', size = 100, stroke = 9 }) {
  const p = clampPercent(percent);
  const CIRC = 2 * Math.PI * 52; // 326.73 aprox
  const dashoffset = ((100 - p) / 100) * CIRC;
  const colorStroke = colorKeyOrHex(color);
  const bg = '#e2e8f0';

  return `
  <div class="gauge-container" style="width:${size}px;height:${size}px;margin:0 auto 10px;position:relative;">
    <svg class="gauge-svg" viewBox="0 0 120 120" width="${size}" height="${size}" style="transform: rotate(-90deg);">
      <circle cx="60" cy="60" r="52" fill="none" stroke="${bg}" stroke-width="${stroke}"></circle>
      <circle cx="60" cy="60" r="52" fill="none" stroke="${colorStroke}" stroke-width="${stroke}"
              stroke-linecap="round" stroke-dasharray="${CIRC.toFixed(2)}" stroke-dashoffset="${dashoffset.toFixed(2)}"></circle>
    </svg>
    <div class="gauge-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
      <span class="gauge-percentage" style="font-size:20pt;font-weight:700;line-height:1;">${toFixedSafe(p,0)}%</span>
      ${subtitle ? `<span class="gauge-subtitle" style="font-size:7.5pt;color:#718096;display:block;margin-top:3px;">${escapeHtml(subtitle)}</span>` : ''}
    </div>
  </div>`;
}

/**
 * Donut multi-segmento (DTC, EA, Aceite, Distribución)
 * parts: [{label, value, color}]
 */
function donutParts({ parts = [], centerText = '', subtitle = '', size = 100, stroke = 9 }) {
  const total = Math.max(0, parts.reduce((a, b) => a + (safeNum(b.value)), 0));
  const S = size;
  const r = 16; // radio base (coincide con tus donuts)
  const bg = '#eeeeee';
  let acc = 25; // inicio (para orientar segmentos)
  let segs = '';

  if (total > 0) {
    parts.forEach(p => {
      const v = safeNum(p.value);
      if (v <= 0) return;
      const pct = (v / total) * 100;
      segs += `
        <circle cx="21" cy="21" r="${r}" fill="none" stroke="${colorKeyOrHex(p.color)}" stroke-width="${stroke}"
          stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${acc}" transform="rotate(-90 21 21)"/>
      `;
      acc -= pct;
    });
  } else {
    segs = `<circle cx="21" cy="21" r="${r}" fill="none" stroke="${bg}" stroke-width="${stroke}"/>`;
  }

  const cText = centerText ? `<text x="21" y="24" font-size="11" font-weight="700" fill="#2d3748" text-anchor="middle">${escapeHtml(centerText)}</text>` : '';
  const subT = subtitle ? `<text x="21" y="33" font-size="6" fill="#718096" text-anchor="middle">${escapeHtml(subtitle)}</text>` : '';

  return `
<svg viewBox="0 0 42 42" width="${S}" height="${S}" style="margin:0 auto;display:block;">
  <circle cx="21" cy="21" r="${r}" fill="none" stroke="${bg}" stroke-width="${stroke}"/>
  ${segs}
  ${cText}
  ${subT}
</svg>`;
}

// ===============================
// HELPERS DE FORMATEO
// ===============================
function safeInt(v) {
  const n = Number(v);
  return (isNaN(n) || n === Infinity || n === -Infinity) ? 0 : Math.floor(n);
}
function safeNum(v) {
  const n = Number(v);
  return (isNaN(n) || n === Infinity || n === -Infinity) ? 0 : n;
}
function toFixedSafe(v, decimals = 1) {
  const n = safeNum(v);
  return Number(n).toFixed(decimals);
}
function clampPercent(v) {
  const n = safeNum(v);
  return (n < 0) ? 0 : (n > 100) ? 100 : n;
}
function escapeHtml(text) {
  if (!text) return '';
  const s = String(text);
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
function colorKeyOrHex(c) {
  if (!c) return '#cccccc';
  if (c.startsWith('#')) return c;
  return colorFor(c);
}

// Paleta Pastel
function colorFor(estado) {
  if (estado === 'critical') return '#e53e3e'; // rojo
  if (estado === 'warning')  return '#ed8936'; // naranja
  if (estado === 'success')  return '#38a169'; // verde
  if (estado === 'info')     return '#4299e1'; // azul
  return '#9ca3af'; // gris fallback
}

// Detecta estado automático (asumiendo "más es mejor" o "menos es mejor")
function estadoPorValor(direccion, valorPct) {
  const p = clampPercent(valorPct);
  const masEsMejor = (direccion === 'positivo');

  if (masEsMejor) {
    if (p >= 80) return { etq: 'success',  txt: 'ÓPTIMO' };
    if (p >= 50) return { etq: 'warning',  txt: 'ATENCIÓN' };
    return { etq: 'critical', txt: 'CRÍTICO' };
  } else {
    if (p <= 20) return { etq: 'success',  txt: 'ÓPTIMO' };
    if (p <= 40) return { etq: 'warning',  txt: 'ATENCIÓN' };
    return { etq: 'critical', txt: 'CRÍTICO' };
  }
}

// ===============================
// COMPONENTS HTML PEQUEÑOS
// ===============================
function alertDTCNumber(dtc) {
  // total_activos si existe; si no, suma por categorías
  const alta   = _pickInt(dtc, ["alta_prioridad", "alta"]);
  const media  = _pickInt(dtc, ["mediana_prioridad", "media", "moderada"]);
  const info   = _pickInt(dtc, ["info", "baja", "informativo"]);
  const total  = _pickInt(dtc, ["total_activos", "total", "activos"]) || _sumInt([alta, media, info]);

  return `
<div class="alert-number">
  <div class="alert-value">${total}</div>
  <div class="alert-label">CÓDIGOS DTC</div>
</div>`;
}

function alertBarsDTCOnly(dtc) {
  const alta   = _pickInt(dtc, ["alta_prioridad", "alta"]);
  const media  = _pickInt(dtc, ["mediana_prioridad", "media", "moderada"]);
  const info   = _pickInt(dtc, ["info", "baja", "informativo"]);
  const total  = alta + media + info;

  const pA = total > 0 ? ((alta  / total) * 100).toFixed(1) : '0.0';
  const pM = total > 0 ? ((media / total) * 100).toFixed(1) : '0.0';
  const pI = total > 0 ? ((info  / total) * 100).toFixed(1) : '0.0';

  return `
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Alta</span><span>${alta}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="critical" style="width:${pA}%">${pA}%</div>
    </div>
  </div>
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Media</span><span>${media}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="warning" style="width:${pM}%">${pM}%</div>
    </div>
  </div>
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Info</span><span>${info}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="info" style="width:${pI}%">${pI}%</div>
    </div>
  </div>
`;
}

/* ---------- EXPERT ALERTS ---------- */
function alertEANumber(ea) {
  const crit = _pickInt(ea, ["critica"]);
  const alta = _pickInt(ea, ["alta"]);
  const rend = _pickInt(ea, ["rendimiento"]);
  const total = _pickInt(ea, ["total_activas", "total"]) || _sumInt([crit, alta, rend]);

  return `
<div class="alert-number">
  <div class="alert-value">${total}</div>
  <div class="alert-label">EXPERT ALERTS</div>
</div>`;
}

function alertBarsEAOnly(ea) {
  const crit = _pickInt(ea, ["critica"]);
  const alta = _pickInt(ea, ["alta"]);
  const rend = _pickInt(ea, ["rendimiento"]);
  const total = crit + alta + rend;

  const pC = total > 0 ? ((crit / total) * 100).toFixed(1) : '0.0';
  const pH = total > 0 ? ((alta / total) * 100).toFixed(1) : '0.0';
  const pR = total > 0 ? ((rend / total) * 100).toFixed(1) : '0.0';

  return `
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Crítica</span><span>${crit}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="critical" style="width:${pC}%">${pC}%</div>
    </div>
  </div>
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Alta</span><span>${alta}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="warning" style="width:${pH}%">${pH}%</div>
    </div>
  </div>
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Rendimiento</span><span>${rend}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="warning" style="width:${pR}%">${pR}%</div>
    </div>
  </div>
`;
}

/* ---------- ANÁLISIS DE ACEITE ---------- */
function alertAceiteNumber(aceite) {
  const normal     = _pickInt(aceite, ["normal"]);
  const precaucion = _pickInt(aceite, ["precaucion"]);
  const anormal    = _pickInt(aceite, ["anormal"]);
  const total      = _pickInt(aceite, ["total_analisis", "total"]) || _sumInt([normal, precaucion, anormal]);

  return `
<div class="alert-number">
  <div class="alert-value">${total}</div>
  <div class="alert-label">ANÁLISIS DE ACEITE</div>
</div>`;
}

function alertBarsAceiteOnly(aceite) {
  const normal     = _pickInt(aceite, ["normal"]);
  const precaucion = _pickInt(aceite, ["precaucion"]);
  const anormal    = _pickInt(aceite, ["anormal"]);
  const total      = normal + precaucion + anormal;

  const pN = total > 0 ? ((normal     / total) * 100).toFixed(1) : '0.0';
  const pP = total > 0 ? ((precaucion / total) * 100).toFixed(1) : '0.0';
  const pA = total > 0 ? ((anormal    / total) * 100).toFixed(1) : '0.0';

  return `
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Normal</span><span>${normal}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="info" style="width:${pN}%">${pN}%</div>
    </div>
  </div>
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Precaución</span><span>${precaucion}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="warning" style="width:${pP}%">${pP}%</div>
    </div>
  </div>
  <div class="alert-bar-item">
    <div class="alert-bar-label"><span>Anormal</span><span>${anormal}</span></div>
    <div class="alert-bar-bg">
      <div class="alert-bar-fill" data-severity="critical" style="width:${pA}%">${pA}%</div>
    </div>
  </div>
`;
}


// ===============================
// BUILDERS DE ESTRUCTURA
// ===============================

/**
 * Genera una lista HTML de recomendaciones a partir del objeto metricas
 */
function buildRecomendaciones(metricas) {
  const items = [];

  // Conectividad
  const desconectados = safeInt(metricas?.totales?.equiposDesconectados || 0);
  const totalEquipos = safeInt(metricas?.totales?.totalEquipos || 0);
  const pctDesconectados = totalEquipos > 0 ? ((desconectados / totalEquipos) * 100) : 0;
  if (pctDesconectados > 20) {
    items.push(`<strong>CONECTIVIDAD:</strong> Revisar ${desconectados} equipos desconectados (${pctDesconectados.toFixed(0)}%) – Pérdida de visibilidad operativa`);
  }

  // DTC
  const dtcAlta = safeInt(metricas?.dtc?.alta_prioridad || 0);
  if (dtcAlta > 0) {
    items.push(`<strong>DTC CRÍTICOS:</strong> Atender ${dtcAlta} códigos de diagnóstico de alta prioridad para evitar fallas mayores`);
  }

  // Expert Alerts
  const eaCritica = safeInt(metricas?.expertAlerts?.critica || 0);
  const eaAlta = safeInt(metricas?.expertAlerts?.alta || 0);
  if (eaCritica > 0 || eaAlta > 0) {
    items.push(`<strong>EXPERT ALERTS:</strong> Resolver ${eaCritica} alertas críticas y ${eaAlta} de alta prioridad detectadas por sistema experto`);
  }

  // Capacitación
  const pctExceso = safeNum(metricas?.porcentajes?.excesoRalenti || 0);
  if (pctExceso > 30) {
    const perdidaAnual = safeNum(metricas?.economico?.perdidaUSD_por_combustible || 0) * 12;
    items.push(`<strong>CAPACITACIÓN:</strong> Implementar programa de reducción de ralentí – ROI estimado: $${perdidaAnual.toLocaleString('en-US')}/año`);
  }

  if (items.length === 0) {
    return '<li>✅ Sin recomendaciones críticas en este periodo</li>';
  }

  return items.map(i => `<li>${i}</li>`).join('\n');
}

/**
 * FUNCIÓN PRINCIPAL: Renderiza todos los gráficos del Resumen Ejecutivo
 * Retorna un objeto con SVGs/HTML listos para inyectar en el template
 */
function renderGraficosResumen(m) {
  // --- Lectura segura ---
  const tot = m?.totales || {};
  const pct = m?.porcentajes || {};
  const eco = m?.economico || {};
  const dtc = m?.dtc || {};
  const ea  = m?.expertAlerts || {};
  const oil = m?.aceite || {};
  const dist= m?.distribucionLineas || {};

  // --- Valores base ---
  const totalEquipos      = safeInt(tot.totalEquipos);
  const equiposTrabajando = safeInt(tot.equiposTrabajando);
  const conectados15d     = safeInt(tot.conectados15d);
  const mantProx          = safeInt(tot.mantProxLt50h);
  const excesoEquipos     = safeInt(tot.equiposExcesoRalenti);

  const horasMotor   = safeNum(tot.horasMotor);
  const horasRalenti = safeNum(tot.horasRalenti);

  const galPerdidos  = safeNum(tot.combPerdidoGal);
  const perdidaUSD   = safeNum(eco.perdidaUSD_por_combustible);

  // --- Porcentajes (como números) ---
  const pCon    = safeNum(pct.conectadas);
  const pMant   = safeNum(pct.mantenimiento);
  const pExceso = safeNum(pct.excesoRalenti);
  const pRalenti= safeNum(pct.ralentiFlota);

  // --- Estados dinámicos coherentes con el CSS pastel ---
  const estadoCon = estadoPorValor('positivo', pCon);
  const estadoMan = estadoPorValor('negativo', pMant);
  const estadoExc = estadoPorValor('negativo', pExceso);
  const estadoRal = estadoPorValor('negativo', pRalenti);

  // --- Gauges principales ---
  const gaugeConectividad = gaugeCircular({
    percent: clampPercent(pCon),
    color: colorFor(estadoCon.etq),
    subtitle: `${conectados15d} de ${totalEquipos}`,
    size: 100, stroke: 9
  });

  const gaugeMantenimiento = gaugeCircular({
    percent: clampPercent(pMant),
    color: colorFor(estadoMan.etq),
    subtitle: `${mantProx} de ${conectados15d}`,
    size: 100, stroke: 9
  });

  const gaugeExcesoRalenti = gaugeCircular({
    percent: clampPercent(pExceso),
    color: colorFor(estadoExc.etq),
    subtitle: `${excesoEquipos} de ${equiposTrabajando}`,
    size: 100, stroke: 9
  });

  const gaugePercentRalentiFlota = gaugeCircular({
    percent: clampPercent(pRalenti),
    color: colorFor(estadoRal.etq),
    subtitle: `${toFixedSafe(horasRalenti,0)}/${toFixedSafe(horasMotor,0)}h`,
    size: 100, stroke: 9
  });

  // --- NUEVO: Alertas separadas (número + barras) ---
  const alertDTC = alertDTCNumber(m.dtc);
  const alertDTCBars = alertBarsDTCOnly(m.dtc);

  const alertEA = alertEANumber(m.expertAlerts);
  const alertEABars = alertBarsEAOnly(m.expertAlerts);

  const alertAceite = alertAceiteNumber(m.aceite);
  const alertAceiteBars = alertBarsAceiteOnly(m.aceite);

  // --- Donut por líneas ---
  const donutLineas = donutParts({
    parts: [
      { label: 'JD C&F', value: safeInt(dist.lineaCF),   color: '#e59500' },
      { label: 'JD A&T', value: safeInt(dist.lineaAF),   color: '#1f772d' },
      { label: 'WIRTGEN',value: safeInt(dist.lineaW),    color: '#40535d' },
      { label: 'TEREX',  value: safeInt(dist.lineaTerex),color: '#ffc900' },
      { label: 'Otros',  value: safeInt(dist.otros),     color: '#9ca3af' }
    ],
    size: 80,
    stroke: 7
  });

  // Estados exportados (con etiquetas y textos desglosados)
  const estados = {
    estadoConectividad: estadoCon,
    estadoMantenimiento: estadoMan,
    estadoExcesoRalenti: estadoExc,
    estadoRalentiFlota: estadoRal,
    // Desglosados para el HTML
    estadoConectividadEtiqueta: estadoCon.etq,
    estadoConectividadTexto: estadoCon.txt,
    estadoMantenimientoEtiqueta: estadoMan.etq,
    estadoMantenimientoTexto: estadoMan.txt,
    estadoExcesoEtiqueta: estadoExc.etq,
    estadoExcesoTexto: estadoExc.txt,
    estadoRalentiEtiqueta: estadoRal.etq,
    estadoRalentiTexto: estadoRal.txt
  };

  return {
    // Gauges principales
    gaugeConectividad,
    gaugeMantenimiento,
    gaugeExcesoRalenti,
    gaugePercentRalentiFlota,
    // NUEVO: número y barras por separado
    alertDTC,
    alertDTCBars,
    alertEA,
    alertEABars,
    alertAceite,
    alertAceiteBars,
    donutLineas,
    ...estados
  };
}


// ===============================
// NUEVA FUNCIÓN: CONECTIVIDAD
// ===============================

/**
 * Prepara datos para la sección de Conectividad
 * Similar a renderGraficosResumen pero específico para conectividad
 */
function renderGraficosConectividad(equipos, periodo) {
  // ============================================
  // 1. CALCULAR MÉTRICAS DE CONECTIVIDAD
  // ============================================
  const totalEquipos = equipos.length;
  let equiposConectados = 0;
  let equiposMantenimiento = 0;

  // Función auxiliar para determinar si está conectado
  function estaConectado(ultConexion, dias = 15) {
    if (!ultConexion) return false;
    const fechaConexion = new Date(ultConexion);
    const hoy = new Date();
    const diferenciaDias = (hoy - fechaConexion) / (1000 * 60 * 60 * 24);
    return diferenciaDias <= dias;
  }

  equipos.forEach(eq => {
    const conectado = estaConectado(eq.ult_conexion, 15);
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

  const gaugeConectividad = gaugeCircular({
    percent: Number(porcentajeConectadas),
    color: colorFor(estadoConectividad),
    subtitle: `${equiposConectados} de ${totalEquipos}`,
    size: 100,
    stroke: 8
  });

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
  // 3. FILTRAR EQUIPOS PARA TABLAS
  // ============================================
  const equiposMantenimientoTabla = equipos
    .filter(eq => {
      const conectado = estaConectado(eq.ult_conexion, 15);
      const hrs = eq.horas_restantes || 0;
      return conectado && hrs > 0 && hrs < 50;
    })
    .sort((a, b) => a.horas_restantes - b.horas_restantes);

  const equiposSinConexion = equipos
    .filter(eq => !estaConectado(eq.ult_conexion, 1000))
    .sort((a, b) => {
      const fechaA = a.ult_conexion ? new Date(a.ult_conexion) : new Date(0);
      const fechaB = b.ult_conexion ? new Date(b.ult_conexion) : new Date(0);
      return fechaA - fechaB;
    });

  // ============================================
  // 4. GENERAR HTML DE TABLA 1 (Mantenimiento)
  // ============================================
  let tablaMantenimientoHTML = '';

  if (equiposMantenimientoTabla.length === 0) {
    tablaMantenimientoHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:20px; color:var(--color-success);">
          ✅ Excelente! Ningún equipo conectado requiere mantenimiento próximo
        </td>
      </tr>
    `;
  } else {
    equiposMantenimientoTabla.forEach(eq => {
      const horasRestantes = eq.horas_restantes || 0;
      const colorHoras = horasRestantes < 10 ? 'var(--color-critical)'
        : horasRestantes < 30 ? 'var(--color-warning)'
        : 'var(--gray-600)';

      const ubicacionLink = eq.latitud && eq.longitud
        ? `<a href="https://www.google.com/maps?q=${eq.latitud},${eq.longitud}" target="_blank" style="color:var(--color-info); text-decoration:none;">📍 Ver</a>`
        : '-';

      const horometroFormat = eq.horas_trabajo_motor_vida_util
        ? Number(eq.horas_trabajo_motor_vida_util).toLocaleString('en-US')
        : '-';

      const proxMtoFormat = eq.prox_mto
        ? Number(eq.prox_mto).toLocaleString('en-US')
        : '-';

      tablaMantenimientoHTML += `
        <tr>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.id_equipo || '-'}</td>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.num_interno || '-'}</td>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.familia || '-'}</td>
          <td style="padding: 4px; text-align: center; border: 1px solid var(--gray-200);">${ubicacionLink}</td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${horometroFormat}</td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${proxMtoFormat}</td>
          <td style="padding: 4px; text-align: right; font-weight: 700; border: 1px solid var(--gray-200); color: ${colorHoras};">
            ${horasRestantes}
          </td>
        </tr>
      `;
    });
  }

  // ============================================
  // 5. GENERAR HTML DE TABLA 2 (Sin Conexión)
  // ============================================
  let tablaSinConexionHTML = '';

  if (equiposSinConexion.length === 0) {
    tablaSinConexionHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:20px; color:var(--color-success);">
          ✅ Excelente! Todos los equipos están conectados
        </td>
      </tr>
    `;
  } else {
    // Mostrar máximo 15 equipos
    equiposSinConexion.slice(0, 1000).forEach(eq => {
      const ubicacionLink = eq.latitud && eq.longitud
        ? `<a href="https://www.google.com/maps?q=${eq.latitud},${eq.longitud}" target="_blank" style="color:var(--color-info); text-decoration:none;">📍 Ver</a>`
        : '-';

      const horometroFormat = eq.horas_trabajo_motor_vida_util
        ? Number(eq.horas_trabajo_motor_vida_util).toLocaleString('en-US')
        : '-';

      const ultConexion = eq.ult_conexion
        ? Utilities.formatDate(new Date(eq.ult_conexion), "America/Lima", "dd/MM/yyyy")
        : 'Sin registro';

      tablaSinConexionHTML += `
        <tr>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.id_equipo || '-'}</td>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.num_interno || '-'}</td>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.familia || '-'}</td>
          <td style="padding: 4px; text-align: center; border: 1px solid var(--gray-200);">${ubicacionLink}</td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${horometroFormat}</td>
          <td style="padding: 4px; text-align: center; border: 1px solid var(--gray-200);">${ultConexion}</td>
        </tr>
      `;
    });

  }

  return {
    // Métricas
    totalEquipos,
    equiposConectados,
    equiposMantenimiento,
    porcentajeConectadas,
    porcentajeMantenimiento,

    // Gauges
    gaugeConectividad,
    gaugeMantenimiento,

    // Estados
    estadoConectividad,
    estadoMantenimiento,
    etiquetaConectividad,
    etiquetaMantenimiento,

    // HTML de tablas pre-generado
    tablaMantenimientoHTML,
    tablaSinConexionHTML
  };
}

/**
 * Renderiza la sección de Utilización y Ralentí con HTML pre-generado
 * @param {Array} equipos - Array de equipos del cliente
 * @param {Object} metricas - Métricas calculadas del cliente
 * @param {Object} periodo - {inicio: "01-10-25", fin: "28-10-25"}
 * @returns {Object} - Objeto con HTML de tabla, footer, resumen y recuadro educativo
 */
function renderUtilizacion(equipos, metricas, periodo, precioPorGalon) {
  // Helpers internos
  function safeNum(val) {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }

  function safeInt(val) {
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  }

  // 1. EXTRAER MÉTRICAS
  const totales = metricas.totales || {};
  const economico = metricas.economico || {};
  
  const equiposExcesoRalenti = safeInt(totales.equiposExcesoRalenti);
  const combPerdidoGal = safeNum(totales.combPerdidoGal);  // ✅ Valor correcto del backend
  const perdidaUSD = safeNum(economico.perdidaUSD_por_combustible);  // ✅ Valor correcto del backend

  // 2. FILTRAR EQUIPOS OPERATIVOS
  const UMBRAL_MINIMO_HORAS = 1;

  const equiposOperativos = equipos
    .filter(eq => {
      const horasTotal = safeNum(eq.horas_total_general);
      const pctRalenti = safeNum(eq.percent_ralent_horas);
      return horasTotal > UMBRAL_MINIMO_HORAS &&
             pctRalenti > 0.01 &&
             pctRalenti < 1.0;
    })
    .sort((a, b) => {
      const pctA = safeNum(a.percent_ralent_horas);
      const pctB = safeNum(b.percent_ralent_horas);
      return pctB - pctA;
    });

  // 3. GENERAR FILAS DE TABLA
  let filasTablaHTML = '';
  let totalHorasTrabajo = 0;
  let totalHorasRalenti = 0;
  let totalHorasTotales = 0;
  let totalCombPerdido = 0;

  if (equiposOperativos.length === 0) {
    filasTablaHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:30px; color:var(--gray-600); font-size:16px;">
          ℹ️ No hay equipos con datos operativos en este periodo
        </td>
      </tr>
    `;
  } else {
    equiposOperativos.forEach(eq => {
      const horasTrabajo = safeNum(eq.horas_funcionamiento_general);
      const horasRalentiEq = safeNum(eq.horas_ralenti_general);
      const horasTotales = safeNum(eq.horas_total_general);
      const pctRalenti = safeNum(eq.percent_ralent_horas) * 100;
      const combPerdido = safeNum(eq.comb_perdido_ral);
      const perdidaUSD_eq = safeNum(eq.impacto_economico_ral);

      totalHorasTrabajo += horasTrabajo;
      totalHorasRalenti += horasRalentiEq;
      totalHorasTotales += horasTotales;
      totalCombPerdido += combPerdido;

      // Color según % ralentí
      let colorPct = '';
      if (pctRalenti < 15) {
        colorPct = 'var(--color-success)';
      } else if (pctRalenti < 20) {
        colorPct = '#d69e2e';
      } else if (pctRalenti < 30) {
        colorPct = 'var(--color-warning)';
      } else {
        colorPct = 'var(--color-critical)';
      }

      const horasTrabajoFormat = horasTrabajo.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      const horasRalentiFormat = horasRalentiEq.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      const horasTotalesFormat = horasTotales.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      const combPerdidoFormat = combPerdido.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      const perdidaUSDFormat = perdidaUSD_eq.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});

      filasTablaHTML += `
        <tr>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.id_equipo || '-'}</td>
          <td style="padding: 4px; border: 1px solid var(--gray-200);">${eq.modelo || '-'}</td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${horasTrabajoFormat}</td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${horasRalentiFormat}</td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${horasTotalesFormat}</td>
          <td style="padding: 4px; text-align: right; font-weight: 700; border: 1px solid var(--gray-200); color: ${colorPct};">
            ${pctRalenti.toFixed(0)}%
          </td>
          <td style="padding: 4px; text-align: right; border: 1px solid var(--gray-200);">${combPerdidoFormat}</td>
          <td style="padding: 4px; text-align: right; font-weight: 700; border: 1px solid var(--gray-200);">$${perdidaUSDFormat}</td>
        </tr>
      `;
    });
  }

  // ✅ Usar valores de métricas (calculados correctamente en backend)
  const combFormat = combPerdidoGal.toLocaleString('en-US', {maximumFractionDigits: 0});
  const perdidaFormat = perdidaUSD.toLocaleString('en-US', {maximumFractionDigits: 0});

  // 4. GENERAR FOOTER
  const footerTablaHTML = equiposOperativos.length > 0 ? `
    <tr style="background: var(--gray-100); font-weight: 700;">
      <td colspan="2" style="text-align: right; padding: 6px; border: 1px solid var(--gray-200);">TOTALES:</td>
      <td style="text-align: right; padding: 6px; border: 1px solid var(--gray-200);">${totalHorasTrabajo.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
      <td style="text-align: right; padding: 6px; border: 1px solid var(--gray-200);">${totalHorasRalenti.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
      <td style="text-align: right; padding: 6px; border: 1px solid var(--gray-200);">${totalHorasTotales.toLocaleString('en-US', {maximumFractionDigits: 1})}</td>
      <td style="text-align: right; padding: 6px; border: 1px solid var(--gray-200);">-</td>
      <td style="text-align: right; padding: 6px; border: 1px solid var(--gray-200);">${combFormat}</td>
      <td style="text-align: right; padding: 6px; border: 1px solid var(--gray-200); color: var(--color-critical);">$${perdidaFormat}</td>
    </tr>
  ` : '';

  // 5. RESUMEN BAJO TABLA
  const equiposConExceso = equiposOperativos.filter(eq => safeNum(eq.percent_ralent_horas) > 0.15).length;
  const equiposOptimos = equiposOperativos.length - equiposConExceso;
  const pctExceso = equiposOperativos.length > 0
    ? ((equiposConExceso / equiposOperativos.length) * 100).toFixed(0)
    : 0;
  const pctOptimo = equiposOperativos.length > 0
    ? ((equiposOptimos / equiposOperativos.length) * 100).toFixed(0)
    : 0;

  const resumenTablaHTML = equiposOperativos.length > 0 ? `
    <div style="margin-top: 10px; padding: 8px; background: var(--gray-50); font-size: 8pt; color: var(--gray-700);">
      📊 <strong>${equiposOperativos.length} equipos operativos</strong> en el periodo |
      ⚠️ <strong>${equiposConExceso}</strong> (${pctExceso}%) superan el umbral del 15% |
      ✅ <strong>${equiposOptimos}</strong> (${pctOptimo}%) operan de manera óptima
    </div>
  ` : '';

  // 6. RECUADRO EDUCATIVO
  const recuadroEducativoHTML = equiposExcesoRalenti > 0 ? `
    <div style="margin-top: 15px; padding: 12px; background: #fef3c7; border-left: 4px solid var(--color-warning); border-radius: 4px;">
      <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
        <div style="font-size: 24px; margin-right: 10px;">💡</div>
        <div>
          <h5 style="margin: 0 0 6px 0; color: #92400e; font-size: 10pt;">¿Sabía que el Ralentí Excesivo Afecta su Motor?</h5>
          <p style="margin: 0 0 6px 0; font-size: 8pt; color: var(--gray-700);">
            El exceso de ralentí se calcula como la diferencia entre el porcentaje de ralentí real y el valor
            recomendado por fábrica. Si el porcentaje real supera el umbral del 15%, se considera exceso de ralentí.
            Un exceso de ralentí puede reducir la vida útil del motor, aumentar el consumo de combustible y generar
            costos de mantenimiento elevados.
          </p>
          <p style="margin: 0; font-size: 8pt; color: #92400e; font-weight: 700;">
            ¡Es importante optimizar el uso de las máquinas para evitar daños y mejorar la rentabilidad a largo plazo!
          </p>
        </div>
      </div>
      <h4 style="margin: 10px 0 6px 0; color: #92400e; font-size: 9pt;">💰 Estimación de Ahorro:</h4>
      <p style="margin: 0; font-size: 8pt; color: var(--gray-700);">
        Si se hubiera evitado el exceso de ralentí, se habrían ahorrado aproximadamente
        <strong>${combFormat} galones de combustible</strong>.
        Considerando un precio de <strong>$${precioPorGalon.toFixed(2)} por galón</strong>, el ahorro estimado sería de
        <strong style="color: #c2410c; font-size: 12pt;">$${perdidaFormat}</strong>
        en el periodo con respecto a toda la flota.
      </p>
    </div>
  ` : '';

  return {
    filasTablaHTML,
    footerTablaHTML,
    resumenTablaHTML,
    recuadroEducativoHTML,
    // Métricas para referencia
    totalEquiposOperativos: equiposOperativos.length,
    equiposConExceso,
    equiposOptimos,
    totalPerdidaUSD: perdidaUSD  // ✅ Retornar el valor correcto
  };
}

/**
 * Renderiza la sección de Contactos con HTML pre-generado
 * @param {Object} cliente - Objeto del cliente con array de contactos
 * @returns {Object} - Objeto con HTML de tabla de contactos
 */
function renderContactos(cliente) {
  // 1. OBTENER CONTACTOS DEL CLIENTE
  const contactos = cliente.contactos || [];

  // 2. GENERAR FILAS DE TABLA
  let filasContactosHTML = '';

  if (contactos.length === 0) {
    filasContactosHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:30px; color:var(--gray-600); font-size:16px;">
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
        ? `<a href="mailto:${contacto.correo}" style="color:var(--color-info); text-decoration:none;">${contacto.correo}</a>`
        : '-';

      // Celular con enlace tel
      const celular = contacto.celular
        ? `<a href="tel:${contacto.celular}" style="color:var(--color-info); text-decoration:none;">${contacto.celular}</a>`
        : '-';

      filasContactosHTML += `
        <tr>
          <td style="padding: 8px; border: 1px solid var(--gray-200); width: 20%;">${cargo}</td>
          <td style="padding: 8px; border: 1px solid var(--gray-200); width: 30%;">${nombre}</td>
          <td style="padding: 8px; border: 1px solid var(--gray-200); width: 30%;">${correo}</td>
          <td style="padding: 8px; border: 1px solid var(--gray-200); width: 20%;">${celular}</td>
        </tr>
      `;
    });
  }

  return {
    filasContactosHTML,
    totalContactos: contactos.length
  };
}


/**
 * renderPortada — Genera la portada (1 página) del Reporte de Gestión de Flota
 *
 * Contrato de entrada:
 *   {
 *     cliente: { razon_social: string, ruc?: string, segmento?: string },
 *     periodo: { ini: string|Date, fin: string|Date, label?: string },
 *     images: { logoBase64?: string, marca?: string }, // logoBase64 (PNG/JPG) recomendado
 *     meta?: { titulo?: string, subtitulo?: string }
 *   }
 *
 * Salida:
 *   { html: string }
 *
 * Notas de implementación:
 * - La función devuelve un bloque .page completo, sin forzar page-break-after
 *   (el control de salto de página lo maneja el layout global/pdf-styles.css).
 * - Usa clases semánticas: .page.portada, .portada-*, para ser estiladas desde pdf-styles.js.
 * - Incluye ancla #portada para la Tabla de Contenidos.
 * - No asume fuentes/colores; eso vive en el CSS global.
 */

function renderPortada2Paginas({ cliente = {}, periodo = {}, images = {}, meta = {} } = {}) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const toDataUrl = (b64, mime = 'image/png') =>
    b64 ? (b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`) : '';

  const titulo    = meta.titulo || 'Reporte de Gestión de Flota - Nº Informe: ';
  const subtitulo = meta.subtitulo || 'Centro de Soluciones Conectadas — IPESA';
  const razon     = cliente.razon_social || 'Cliente';
  const rucTxt    = cliente.ruc ? `RUC ${cliente.ruc}` : '';
  const segmento  = cliente.segmento || '';

  const fmt = (d) => {
    if (!d) return '';
    const dd = (d instanceof Date) ? d : new Date(d);
    const y = dd.getFullYear(), m = String(dd.getMonth()+1).padStart(2,'0'), day = String(dd.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };
  const periodoTxt = periodo.label || `${fmt(periodo.inicioDate)} — ${fmt(periodo.finDate)}`;

  const imgHero  = toDataUrl(images.fleetAssurance || images.hero);
  const imgInst  = toDataUrl(images.imagenInstitucional || images.institucional);
  const imgCSC   = toDataUrl(images.logoCSC);
  const imgIPESA = toDataUrl(images.logoIpesa || images.logoIPESA);

  const pagina1 = `
  <section class="page portada portada-hero" aria-label="Portada principal">
    <div class="portada-hero-wrap">
      ${imgHero ? `<img class="img-cover" src="${esc(imgHero)}" alt="Imagen portada" />` : ''}
      <div class="overlay-top">
        ${imgCSC ? `<img class="logo-csc" src="${esc(imgCSC)}" alt="Logo CSC" />` : ''}
      </div>
      <div class="overlay-bottom">
        <div class="texto">
          <h1 class="title">${esc(titulo)}</h1>
          <p class="subtitle">${esc(subtitulo)}</p>
          <div class="cliente">${esc(razon)}</div>
          <div class="chips">
            ${segmento ? `<span class="chip chip-segmento">${esc(segmento)}</span>` : ''}
            <span class="chip chip-periodo">${esc(periodoTxt)}</span>
            ${rucTxt ? `<span class="chip chip-ruc">${esc(rucTxt)}</span>` : ''}
          </div>
        </div>
        <div class="logos">
          ${imgIPESA ? `<img class="logo-ipesa" src="${esc(imgIPESA)}" alt="Logo IPESA" />` : ''}
        </div>
      </div>
    </div>
  </section>`;

  const pagina2 = `
  <section class="page portada portada-institucional" aria-label="Portada institucional">
    <div class="portada-institucional-wrap">
      ${imgInst ? `<img class="img-cover" src="${esc(imgInst)}" alt="Imagen institucional" />` : ''}
    </div>
  </section>`;

  return { html: pagina1 + pagina2 };
}



/**
 * renderDTC — Sección completa de Códigos de Diagnóstico (DTC)
 *
 * IN:
 *  {
 *    equipos: [{
 *      id_equipo?, pin?, num_serie?, numero_serie?,
 *      modelo?, familia?, num_interno?,
 *      dtc?: [{ descripcion, severidad, repeticiones, fecha_inicio?, fecha_fin? }]
 *    }],
 *    periodo: { ini?: string|Date, fin?: string|Date, label?: string },
 *    opciones?: { ordenar?: 'criticos'|'recientes'|'frecuencia'; maxFilas?: number }
 *  }
 *
 * OUT: { html: string, resumen: {...} }
 */
function renderDTC({ equipos = [], periodo = {}, opciones = {} } = {}) {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/\"/g, '&quot;').replace(/'/g, '&#39;');

  const fmt = (d) => {
    if (!d) return '';
    try {
      const dd = (d instanceof Date) ? d : new Date(d);
      const y = dd.getFullYear(), m = String(dd.getMonth()+1).padStart(2,'0'), day = String(dd.getDate()).padStart(2,'0');
      return `${y}-${m}-${day}`;
    } catch(e){ return esc(String(d)); }
  };

  // === helpers basados en tu versión previa ===
  function extraerCodigoYDescripcion(descripcionCompleta) {
    if (!descripcionCompleta) return { codigo: "N/A", descripcionLimpia: "" };
    let codigo = "", descripcionLimpia = descripcionCompleta;

    if (descripcionCompleta.includes(":")) {
      const partes = descripcionCompleta.split(":");
      codigo = partes[0].trim();
      descripcionLimpia = partes.slice(1).join(":").trim();
    } else {
      const match = descripcionCompleta.match(/^(\d{4}-\d{3})/);
      if (match) {
        codigo = match[1];
        descripcionLimpia = descripcionCompleta.replace(/^\d{4}-\d{3}\s*/, "").trim();
      } else {
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
    if (descripcionLimpia.length > 250) descripcionLimpia = descripcionLimpia.substring(0, 247) + "...";
    return { codigo, descripcionLimpia };
  }

  const equiposConDTC = (equipos || []).map(eq => {
    const lista = Array.isArray(eq.dtc) ? eq.dtc : [];
    const dtcsProc = lista.map(d => {
      const { codigo, descripcionLimpia } = extraerCodigoYDescripcion(d.descripcion);
      const severidad = (d.severidad || "Mediana").toLowerCase().includes("alta") ? "Alta" : "Mediana";
      return {
        codigo,
        descripcion: descripcionLimpia,
        repeticiones: Number(d.repeticiones || 1),
        severidad,
        first: d.fecha_inicio || '',
        last: d.fecha_fin || ''
      };
    });

    const criticos = dtcsProc.filter(x => x.severidad === "Alta").sort((a,b)=>b.repeticiones-a.repeticiones);
    const atencion = dtcsProc.filter(x => x.severidad === "Mediana").sort((a,b)=>b.repeticiones-a.repeticiones);

    return {
      id_equipo: eq.id_equipo || eq.pin || eq.num_serie || eq.numero_serie || '',
      pin: eq.pin || eq.num_serie || eq.numero_serie || '',
      modelo: eq.modelo || '',
      familia: eq.familia || 'OTROS',
      num_interno: eq.num_interno || '',
      dtcsCriticos: criticos,
      dtcsAtencion: atencion,
      totalCriticos: criticos.length,
      totalAtencion: atencion.length,
      totalDTCs: dtcsProc.length
    };
  }).filter(eq => (eq.totalDTCs || 0) > 0);

  if (!equiposConDTC.length) {
    const periodoTxt = `Periodo: del ${periodo.inicio} al ${periodo.fin}`;
    const htmlNo = `
    <section class="page page-dtc">
      <div class="header"><h1>🛠️ CÓDIGOS DE DIAGNÓSTICO (DTC)</h1>
        <div class="header-subtitle">${esc(periodoTxt)}</div>
      </div>

      <div class="section">
        <div class="dtc-info-box">
          <h4 class="dtc-info-title">🔧 ¿Sabía que las máquinas John Deere cuentan con autodiagnóstico en tiempo real?</h4>
          <p class="dtc-info-text">Los Códigos DTC comunican fallas eléctricas/electrónicas en tiempo real y ayudan a reducir inactividad.</p>
        </div>

        <div class="dtc-status-positive">
          <div class="status-icon-large">✓</div>
          <h3 class="status-title">Estado Óptimo de la Flota</h3>
          <p class="status-message">No se han generado códigos de diagnóstico en este periodo.</p>
          <p class="status-description">Indica buen mantenimiento, sistemas dentro de parámetros y menor riesgo de paradas.</p>
          <ul class="status-benefits">
            <li>Buen estado del mantenimiento preventivo</li>
            <li>Menor riesgo de paradas inesperadas</li>
            <li>Reducción de costos correctivos</li>
          </ul>
        </div>
      </div>
    </section>`;
    return { html: htmlNo, resumen: { totalEquipos: equipos.length, equiposAfectados: 0 } };
  }

  // split + orden
  const equiposConCriticos = equiposConDTC.filter(e=>e.totalCriticos>0).sort((a,b)=>b.totalCriticos-a.totalCriticos);
  const equiposSoloAtencion = equiposConDTC.filter(e=>e.totalCriticos===0 && e.totalAtencion>0).sort((a,b)=>b.totalAtencion-a.totalAtencion);

  // KPIs
  const totalEquipos = (equipos || []).length;
  const equiposAfectados = equiposConDTC.length;
  const pctAfectados = totalEquipos ? Math.round((equiposAfectados/totalEquipos)*100) : 0;

  let totalCrit = 0, totalAten = 0;
  equiposConDTC.forEach(e => { totalCrit += e.totalCriticos; totalAten += e.totalAtencion; });
  const totalEventos = totalCrit + totalAten;
  const pctCrit = totalEventos ? Math.round((totalCrit/totalEventos)*100) : 0;
  const pctAten = totalEventos ? Math.round((totalAten/totalEventos)*100) : 0;

  // familias
  const famMap = {};
  equiposConDTC.forEach(e=>{
    const f = e.familia || 'OTROS';
    if (!famMap[f]) famMap[f] = { nombre:f, equipos:0, criticos:0, atencion:0 };
    famMap[f].equipos += 1;
    famMap[f].criticos += e.totalCriticos;
    famMap[f].atencion += e.totalAtencion;
  });
  const porFamilia = Object.values(famMap).sort((a,b)=>b.equipos-a.equipos);


  // resumen ejecutivo (igual a tu preview)
  const graficoFamilias = porFamilia.map(f=>{
    const totalFam = f.criticos + f.atencion;
    const pC = totalFam ? (f.criticos/totalFam)*100 : 0;
    const pA = totalFam ? (f.atencion/totalFam)*100 : 0;
    return `
      <div class="familia-row-visual">
        <div class="familia-info">
          <div class="familia-nombre-visual">${esc(f.nombre)}</div>
          <div class="familia-numeros">${f.equipos} equipo${f.equipos>1?'s':''}</div>
        </div>
        <div class="familia-barra-visual">
          <div class="barra-container-visual">
            ${f.criticos ? `<div class="barra-segmento critico" style="width:${pC}%;">${f.criticos}</div>`:''}
            ${f.atencion ? `<div class="barra-segmento atencion" style="width:${pA}%;">${f.atencion}</div>`:''}
          </div>
          <div class="barra-leyenda">
            ${f.criticos ? `<span class="leyenda-critico">Críticos: ${f.criticos}</span>`:''}
            ${f.atencion ? `<span class="leyenda-atencion">Atención: ${f.atencion}</span>`:''}
          </div>
        </div>
      </div>`;
  }).join('');

  const resumenHTML = `
    <div class="resumen-box-mejorado">
      <div class="resumen-header"><h3 class="resumen-title-mejorado">ESTADO GENERAL DE LA FLOTA</h3></div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-label">Total Equipos</div><div class="stat-value-big">${totalEquipos}</div></div>
        <div class="stat-card highlight"><div class="stat-label">Equipos con alertas</div>
          <div class="stat-value-big">${equiposAfectados} <span class="stat-percent">(${pctAfectados}%)</span></div>
        </div>
        <div class="stat-card"><div class="stat-label">Total de códigos</div><div class="stat-value-big">${totalEventos}</div></div>
      </div>
      <div class="resumen-divider-mejorado"></div>
      <div class="seccion-familias">
        <h4 class="seccion-title">DISTRIBUCIÓN POR FAMILIA</h4>
        <div class="familias-grafico">${graficoFamilias}</div>
      </div>
      <div class="resumen-divider-mejorado"></div>
      <div class="seccion-prioridad">
        <h4 class="seccion-title">NIVEL DE PRIORIDAD</h4>
        <div class="prioridad-item">
          <div class="prioridad-header"><span class="prioridad-label critico">Alta prioridad</span>
            <span class="prioridad-value">${totalCrit} código${totalCrit!==1?'s':''} (${pctCrit}%)</span>
          </div>
          <div class="prioridad-bar-container"><div class="prioridad-bar critico" style="width:${pctCrit}%;"></div></div>
        </div>
        <div class="prioridad-item">
          <div class="prioridad-header"><span class="prioridad-label atencion">Mediana prioridad</span>
            <span class="prioridad-value">${totalAten} código${totalAten!==1?'s':''} (${pctAten}%)</span>
          </div>
          <div class="prioridad-bar-container"><div class="prioridad-bar atencion" style="width:${pctAten}%;"></div></div>
        </div>
      </div>
    </div>`;

  function tablaDTCs(dtcs, totalCodigos) {
    // Mostrar TODOS los códigos sin límite
    const filas = dtcs.map(d => {
      const claseSev = d.severidad === "Alta" ? "severity-high" : "severity-medium";
      const letra = d.severidad === "Alta" ? "A" : "M";
      return `
        <tr>
          <td>${esc(d.codigo)}</td>
          <td>${esc(d.descripcion)}</td>
          <td>${esc(d.repeticiones)}</td>
          <td><span class="severity-badge ${claseSev}">${letra}</span></td>
        </tr>`;
    }).join('');

    return `
      <table class="dtc-table">
        <thead>
          <tr>
            <th>CÓDIGO</th>
            <th>DESCRIPCIÓN</th>
            <th>FREC</th>
            <th>SEVERIDAD</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>`;
  }

  function tarjetaEquipo(eq, tipo) {
    // Combinar todos los DTCs en una sola lista, ordenados por severidad
    const todosDTCs = [];
    if (eq.dtcsCriticos && eq.dtcsCriticos.length) {
      todosDTCs.push(...eq.dtcsCriticos);
    }
    if (eq.dtcsAtencion && eq.dtcsAtencion.length) {
      todosDTCs.push(...eq.dtcsAtencion);
    }

    let html = `
      <div class="equipment-header">
        <div>
          <div class="equipment-title">${esc(eq.familia)} ${esc(eq.modelo)} - ${esc(eq.num_interno||'')}</div>
          <div class="equipment-serie">Serie: ${esc(eq.id_equipo)}</div>
        </div>
        <div class="codes-badge">${eq.totalDTCs} código${eq.totalDTCs>1?'s':''} activo${eq.totalDTCs>1?'s':''}</div>
      </div>`;

    if (todosDTCs.length > 0) {
      html += `
        <div class="codes-section">
          ${tablaDTCs(todosDTCs, todosDTCs.length)}
        </div>`;
    }
    return html;
  }

  // Combinar todos los equipos ordenados por cantidad de códigos críticos (descendente)
  const todosEquipos = [...equiposConCriticos, ...equiposSoloAtencion];

  const leyendaGlobal = todosEquipos.length ? `
    <div style="font-size: 7pt; color: #718096; margin: 10px 0 8px 0; padding: 6px 12px; background: #f8f9fa; border-left: 3px solid #367c2b; border-radius: 4px;">
      <strong style="color: #212529;">Leyenda de severidad:</strong>
      <span style="margin-left: 10px;"><span style="display: inline-block; padding: 2px 6px; background: #dc3545; color: white; border-radius: 3px; font-weight: bold; font-size: 6.5pt;">A</span> = Alta prioridad</span>
      <span style="margin-left: 15px;"><span style="display: inline-block; padding: 2px 6px; background: #ffc107; color: #333; border-radius: 3px; font-weight: bold; font-size: 6.5pt;">M</span> = Mediana prioridad</span>
    </div>` : '';

  const bloqueEquipos = todosEquipos.length
    ? todosEquipos.map(eq => tarjetaEquipo(eq, 'normal')).join('')
    : '';

  const html = `
  <section class="page page-dtc" id="dtc">
    <div class="header"><h1>🛠️ CÓDIGOS DE DIAGNÓSTICO (DTC)</h1>
      <div class="header-subtitle">Periodo: del ${periodo.inicio || ''} al ${periodo.fin || ''}</div>
    </div>

    <div class="section">
      <div class="section-header">Resumen</div>
      ${resumenHTML}
    </div>

    ${leyendaGlobal}
    ${bloqueEquipos ? `<div class="section">${bloqueEquipos}</div>` : ''}

  </section>`;

  return {
    html,
    resumen: {
      totalEquipos, equiposAfectados, pctAfectados, totalEventos,
      totalCriticos: totalCrit, totalAtencion: totalAten, pctCriticos: pctCrit, pctAtencion: pctAten,
      porFamilia
    }
  };
}

/**
 * ============================================================
 * 🎨 renderAnalisisFluidosChart() - NO SE USA EN PDF
 * ============================================================
 * NOTA: Esta función NO se ejecuta al generar PDFs porque
 * Google Apps Script HtmlService.getAs(MimeType.PDF) NO ejecuta JavaScript.
 * Se mantiene comentada por si se necesita para previews en navegador.
 * ============================================================
 */
/*
function renderAnalisisFluidosChart(canvas, data) {
  if (!canvas || !window.Chart) return null;

  const total =
    (data.anormal || 0) + (data.precaucion || 0) + (data.normal || 0);

  const pctAnormal = total ? ((data.anormal / total) * 100).toFixed(1) : 0;
  const pctPrecaucion = total ? ((data.precaucion / total) * 100).toFixed(1) : 0;
  const pctNormal = total ? ((data.normal / total) * 100).toFixed(1) : 0;

  const ctx = canvas.getContext("2d");

  // Destruir gráfico previo si existe
  if (canvas._chartInstance) {
    canvas._chartInstance.destroy();
  }

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Anormal", "Precaución", "Normal"],
      datasets: [
        {
          label: "% de muestras",
          data: [pctAnormal, pctPrecaucion, pctNormal],
          backgroundColor: ["#d32f2f", "#f57c00", "#388e3c"],
          borderColor: ["#b71c1c", "#ef6c00", "#2e7d32"],
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { left: 10, right: 10, top: 10, bottom: 10 },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.parsed.x}%`;
            },
          },
        },
        title: {
          display: true,
          text: "Distribución de resultados de análisis de fluidos",
          font: { size: 14, weight: "bold" },
          color: "#212121",
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(0,0,0,0.05)" },
          ticks: {
            color: "#424242",
            callback: (value) => value + "%",
          },
          min: 0,
          max: 100,
        },
        y: {
          grid: { display: false },
          ticks: { color: "#212121", font: { weight: "bold" } },
        },
      },
    },
  });

  canvas._chartInstance = chart;
  return chart;
}
*/


/**
 * ============================================================
 * 🧪 generarAnalisisFluidosRenderizado()
 * Crea la sección de Análisis de Fluidos con gráfico Chart.js
 * ============================================================
 * @param {Array} equipos - Equipos del cliente
 * @param {Object} periodo - {inicio, fin}
 * @param {Object} logos - imágenes base64 (opcional)
 * @returns {String} HTML de la sección
 */
function generarAnalisisFluidosRenderizado(equipos, periodo, logos) {
  // 1️⃣ Filtrar equipos con análisis
  const equiposConAnalisis = equipos.filter(eq => (eq.ac || []).length > 0);
  const imagenPromo = logos?.imagenAceite || null;

  // 2️⃣ Si no hay análisis → mensaje promocional
  if (equiposConAnalisis.length === 0) {
    return `
      <section id="fluidos" class="page page-fluidos">
        <div class="header">
          <h1>🔬 ANÁLISIS DE FLUIDOS</h1>
          <div class="header-subtitle">Periodo: del ${periodo.inicio} al ${periodo.fin}</div>
        </div>

        <div class="fluidos-mensaje-simple">
          <p class="mensaje-principal">
            No se registran resultados de análisis de aceite en este periodo.
          </p>
          <p>
            IPESA pone a su disposición <strong>ALS</strong>, laboratorio internacionalmente reconocido 
            por su excelencia en análisis de fluidos.
          </p>
          <p>
            Confíe en la experiencia de <strong>IPESA</strong> y <strong>ALS</strong> 
            para garantizar el máximo rendimiento de sus equipos.
          </p>
        </div>

        ${logos?.imagenAceite ? `
        <div class="fluidos-imagen-container">
          <img src="data:image/png;base64,${logos.imagenAceite}" class="fluidos-imagen-grande" alt="Programa ALS" />
        </div>` : ''}
      </section>
    `;
  }

  // 3️⃣ Clasificar resultados
  let anormal = 0, precaucion = 0, normal = 0;
  equiposConAnalisis.forEach(eq => {
    (eq.ac || []).forEach(a => {
      if (a.resultado === "Anormal") anormal++;
      else if (a.resultado === "Precaución") precaucion++;
      else normal++;
    });
  });

  // 4️⃣ Totales
  const total = anormal + precaucion + normal;
  const pctAnormal = total ? ((anormal / total) * 100).toFixed(0) : 0;
  const pctPrecaucion = total ? ((precaucion / total) * 100).toFixed(0) : 0;
  const pctNormal = total ? ((normal / total) * 100).toFixed(0) : 0;

  // 5️⃣ HTML de la sección
  return `
    <section id="fluidos" class="page page-fluidos">
      <div class="header">
        <h1>🔬 ANÁLISIS DE FLUIDOS</h1>
        <div class="header-subtitle">Periodo: del ${periodo.inicio} al ${periodo.fin}</div>
      </div>

      <!-- 📊 Resumen gráfico -->
      <div class="fluidos-chart-container" style="height:220px; margin:20px 0;">
        <canvas id="chartFluidos" width="800" height="200"></canvas>
      </div>

      <div class="fluidos-legend">
        <p><span style="color:#d32f2f;">●</span> Anormal (${pctAnormal}%)</p>
        <p><span style="color:#f57c00;">●</span> Precaución (${pctPrecaucion}%)</p>
        <p><span style="color:#388e3c;">●</span> Normal (${pctNormal}%)</p>
      </div>

      <!-- 🧾 Listado detallado -->
      <div class="fluidos-detalle">
        ${equiposConAnalisis.map(eq => {
          const muestras = eq.ac.map(m => `
            <tr>
              <td>${m.compartimiento || "-"}</td>
              <td>${m.muestra || "-"}</td>
              <td>${m.resultado || "-"}</td>
              <td><a href="${m.pdf || "#"}" target="_blank">Ver</a></td>
            </tr>
          `).join('');
          return `
            <div class="fluidos-equipo">
              <h4>${eq.familia || ""} - ${eq.modelo || ""} - ${eq.num_interno || ""}</h4>
              <table class="tabla-fluidos">
                <thead><tr><th>Compartimiento</th><th>Muestra</th><th>Resultado</th><th>Informe</th></tr></thead>
                <tbody>${muestras}</tbody>
              </table>
            </div>
          `;
        }).join('')}
      </div>
    </section>

    <!-- Script comentado: No se ejecuta en generación de PDF -->
    <!--
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const canvas = document.getElementById('chartFluidos');
        if (canvas) {
          renderAnalisisFluidosChart(canvas, {
            anormal: ${anormal},
            precaucion: ${precaucion},
            normal: ${normal}
          });
        }
      });
    </script>
    -->
  `;
}


//EXPERT ALERT
/**
 * ============================================
 * SECCIÓN: EXPERT ALERTS (EA)
 * ============================================
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
      <div class="header">
        <h1>⚠️ EXPERT ALERTS</h1>
        <div class="header-subtitle">Periodo: del ${periodo.inicio} al ${periodo.fin}</div>
      </div>

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
      <div class="header">
        <h1>⚠️ EXPERT ALERTS</h1>
        <div class="header-subtitle">Periodo: del ${periodo.inicio} al ${periodo.fin}</div>
      </div>

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

/******************************************************
 * SECCIÓN: ACCIONES Y RECOMENDACIONES
 ******************************************************/

/**
 * Genera la sección completa de Acciones y Recomendaciones
 * @param {Array} equipos
 * @param {Object} periodo - {inicio:"dd-mm-aaaa", fin:"dd-mm-aaaa"} o {fecha_inicio, fecha_fin}
 * @returns {String} HTML
 */
function generarAccionesRecomendaciones(equipos, periodo) {
  const p = _acc_normPeriodo(periodo);

  // 1) Clasificar equipos por prioridad
  const equiposConAcciones = [];
  (equipos || []).forEach(equipo => {
    const res = _acc_clasificarEquipoPorPrioridad(equipo);
    if (res) equiposConAcciones.push({ equipo, prioridad: res.prioridad, acciones: res.acciones });
  });

  // 2) Si no hay acciones, mensaje positivo
  if (!equiposConAcciones.length) {
    return _acc_generarMensajeSinAcciones(p);
  }

  // 3) Separar por prioridad
  const criticas    = equiposConAcciones.filter(e => e.prioridad === 'critica');
  const altas       = equiposConAcciones.filter(e => e.prioridad === 'alta');
  const preventivas = equiposConAcciones.filter(e => e.prioridad === 'preventiva');

  // 4) Secciones
  const seccionCriticas    = criticas.length    ? _acc_generarSeccionPrioridad(criticas, 'critica')      : '';
  const seccionAltas       = altas.length       ? _acc_generarSeccionPrioridad(altas, 'alta')           : '';
  const seccionPreventivas = preventivas.length ? _acc_generarSeccionPrioridad(preventivas, 'preventiva'): '';

  // 5) Asesores
  const asesoresUnicos = _acc_obtenerAsesoresUnicos(equiposConAcciones);
  const tablaContactos = _acc_generarTablaContactosAsesores(asesoresUnicos);

  // 6) HTML final (con CSS encapsulado)
  return `
    <div class="page page-acciones">
      <style>
        .page-acciones { background:#fff; padding:50px 70px; page-break-after:always; font-family:Arial,sans-serif; box-sizing:border-box; }
        .page-acciones .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:3px solid #f57c00; }
        .page-acciones .section-header h2 { margin:0; color:#f57c00; font-size:24px; font-weight:700; }
        .page-acciones .btn-volver { color:#3182ce; text-decoration:none; font-size:13px; font-weight:600; }
        .page-acciones .periodo-text { font-size:13px; color:#666; margin:10px 0 18px; }

        .page-acciones .acciones-section-header { margin:26px 0 14px; }
        .page-acciones .acciones-section-title { margin:0; padding:12px 16px; background:linear-gradient(135deg,#424242,#616161); color:#fff; font-size:15px; font-weight:700; border-radius:6px; text-transform:uppercase; letter-spacing:.5px; }

        .page-acciones .accion-tarjeta { background:#fff; border:1px solid #e0e0e0; border-radius:8px; padding:18px; margin-bottom:16px; box-shadow:0 2px 4px rgba(0,0,0,.05); page-break-inside:avoid; }
        .page-acciones .accion-tarjeta-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #f0f0f0; padding-bottom:10px; margin-bottom:12px; }
        .page-acciones .accion-equipo-titulo { margin:0; color:#212121; font-size:15px; font-weight:700; }
        .page-acciones .accion-equipo-serie { color:#757575; font-size:12px; font-weight:600; }
        .page-acciones .accion-subtitulo { margin:0 0 12px; color:#424242; font-size:13px; font-weight:700; }
        .page-acciones .accion-item { margin-bottom:12px; }
        .page-acciones .accion-descripcion { font-size:13px; color:#212121; line-height:1.55; margin-bottom:4px; }
        .page-acciones .accion-contexto { font-size:12px; color:#757575; padding-left:22px; }

        .page-acciones .acciones-contactos { margin-top:26px; padding-top:20px; border-top:3px solid #e0e0e0; }
        .page-acciones .contactos-titulo { margin:0 0 8px; color:#212121; font-size:16px; font-weight:700; }
        .page-acciones .contactos-intro { font-size:13px; color:#424242; margin:0 0 14px; line-height:1.55; }
        .page-acciones .contactos-tabla { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e0e0e0; border-radius:6px; overflow:hidden; }
        .page-acciones .contacto-header-row { background:#f5f5f5; border-bottom:2px solid #e0e0e0; }
        .page-acciones .contacto-th { padding:10px 12px; text-align:left; font-size:12px; font-weight:700; color:#424242; }
        .page-acciones .contacto-fila { border-bottom:1px solid #f0f0f0; }
        .page-acciones .contacto-fila:last-child { border-bottom:none; }
        .page-acciones .contacto-fila td { padding:10px 12px; font-size:12px; color:#424242; }
        .page-acciones .contacto-nombre { font-weight:600; color:#212121; }

        .page-acciones .acciones-status-positive { background:#e8f5e9; border:2px solid #66bb6a; border-radius:8px; padding:28px; text-align:center; margin-top:18px; }
        .page-acciones .status-icon-large { font-size:44px; margin-bottom:12px; }
        .page-acciones .status-title { margin:0 0 12px; color:#2e7d32; font-size:18px; font-weight:700; }
        .page-acciones .status-message { font-size:14px; color:#424242; margin-bottom:14px; font-weight:600; }
        .page-acciones .status-description { font-size:13px; color:#424242; margin-bottom:10px; }
        .page-acciones .status-benefits { text-align:left; display:inline-block; margin:0; padding-left:18px; }
        .page-acciones .status-benefits li { font-size:13px; color:#424242; margin-bottom:6px; line-height:1.55; }
      </style>

      <!-- Header -->
      <div class="header">
        <h1>💡 ACCIONES Y RECOMENDACIONES</h1>
        <div class="header-subtitle">Periodo: del ${_acc_fmt(p.inicio)} al ${_acc_fmt(p.fin)}</div>
      </div>

      <!-- Secciones -->
      ${seccionCriticas}
      ${seccionAltas}
      ${seccionPreventivas}

      <!-- Contactos -->
      ${tablaContactos}
    </div>
  `;
}

/* ---------- Helpers internos ---------- */

function _acc_normPeriodo(periodo) {
  return {
    inicio: (periodo && (periodo.inicio || periodo.fecha_inicio)) || '',
    fin:    (periodo && (periodo.fin    || periodo.fecha_fin))    || ''
  };
}

function _acc_clasificarEquipoPorPrioridad(equipo) {
  const acciones = [];
  let prioridad = null;

  // 1) EA Críticas
  const eaCriticas = (equipo.ea || []).filter(a => a.severidad === 'Crítica');
  if (eaCriticas.length && !prioridad) prioridad = 'critica';
  eaCriticas.forEach(a => acciones.push({
    tipo:'ea_critica', icono:'🔴',
    descripcion:`Atender alerta crítica: ${a.descripcion || 'Alerta crítica'}`,
    contexto:`Estado: ${a.estado || 'Nueva'} | Fecha: ${_acc_fmtFecha(a.fecha)}`
  }));

  // 2) Fluidos Anormales
  const acAnormales = (equipo.ac || []).filter(a => a.resultado === 'Anormal');
  if (acAnormales.length && !prioridad) prioridad = 'critica';
  acAnormales.forEach(a => acciones.push({
    tipo:'fluido_anormal', icono:'🧪',
    descripcion:`Revisar resultado anormal en ${a.compartimiento || 'compartimiento'}`,
    contexto:`Muestra: ${a.muestra || '-'}`
  }));

  // 3) DTC Alta repetitivos (>=3)
  const dtcCriticos = (equipo.dtc || []).filter(d => d.severidad === 'Alta' && (d.repeticiones||0) >= 3);
  if (dtcCriticos.length && !prioridad) prioridad = 'critica';
  acciones.push({
    tipo:'dtc_critico', icono:'⚠️',
    descripcion:`Revisar código de diagnóstico`
  });

  // 4) Sin conexión >30d
  const diasSC = _acc_diasSinConexion(equipo.ult_conexion);
  if (diasSC > 30 && !prioridad) prioridad = 'critica';
  if (diasSC > 30) acciones.push({
    tipo:'conectividad_critica', icono:'📡',
    descripcion:`Revisar conectividad (sin conexión hace ${diasSC} días)`,
    contexto:`Última conexión: ${_acc_fmtFecha(equipo.ult_conexion)}`
  });

  // 5) EA Altas
  const eaAltas = (equipo.ea || []).filter(a => a.severidad === 'Alta');
  if (eaAltas.length && !prioridad) prioridad = 'alta';
  eaAltas.forEach(a => acciones.push({
    tipo:'ea_alta', icono:'🟠',
    descripcion:`Atender alerta alta: ${a.descripcion || 'Alerta alta'}`,
    contexto:`Estado: ${a.estado || 'Nueva'} | Fecha: ${_acc_fmtFecha(a.fecha)}`
  }));

  // 6) Fluidos Precaución
  const acPrec = (equipo.ac || []).filter(a => a.resultado === 'Precaución');
  if (acPrec.length && !prioridad) prioridad = 'alta';
  acPrec.forEach(a => acciones.push({
    tipo:'fluido_precaucion', icono:'🧪',
    descripcion:`Monitorear resultado en precaución en ${a.compartimiento || 'compartimiento'}`,
    contexto:`Muestra: ${a.muestra || '-'}`
  }));

  // 7) Exceso de ralentí >10%
  const excesoRalenti = equipo.percent_exces_ralent_horas || 0;
  if (excesoRalenti > 0.10 && !prioridad) prioridad = 'alta';
  if (excesoRalenti > 0.10) {
    const impacto = _acc_calcularImpactoRalenti(equipo);
    acciones.push({
      tipo:'ralenti_critico', icono:'⚙️',
      descripcion:`Reducir exceso de ralentí (actualmente ${(excesoRalenti*100).toFixed(0)}%)`,
      contexto:`Impacto: $${impacto.toFixed(2)} en el periodo`
    });
  }

  // 8) Sin conexión 15–30d
  if (diasSC >= 15 && diasSC <= 30 && !prioridad) prioridad = 'alta';
  if (diasSC >= 15 && diasSC <= 30) acciones.push({
    tipo:'conectividad_alta', icono:'📡',
    descripcion:`Revisar conectividad (sin conexión hace ${diasSC} días)`,
    contexto:`Última conexión: ${_acc_fmtFecha(equipo.ult_conexion)}`
  });

  // 9) DTC Alta NO repetitivos
  const dtcAltos = (equipo.dtc || []).filter(d => d.severidad === 'Alta' && (d.repeticiones||0) < 3);
  if (dtcAltos.length && !prioridad) prioridad = 'alta';
  // acciones.push({
  //   tipo:'dtc_alto', icono:'⚠️',
  //   descripcion:`Monitorear código: ${d.descripcion_corta || d.codigo || 'Código'}`,
  //   contexto:`Frecuencia: ${d.repeticiones || 0} ocurrencias`
  // });

  // 10) EA Rendimiento
  const eaRend = (equipo.ea || []).filter(a => a.severidad === 'Alta-Rendimiento');
  if (eaRend.length && !prioridad) prioridad = 'preventiva';
  eaRend.forEach(a => acciones.push({
    tipo:'ea_rendimiento', icono:'🟡',
    descripcion:`Optimizar: ${a.descripcion || 'Alerta de rendimiento'}`,
    contexto:`Estado: ${a.estado || 'Nueva'} | Fecha: ${_acc_fmtFecha(a.fecha)}`
  }));

  // 11) Mantenimiento próximo (<50 h)
  const horasRest = equipo.horas_restantes || 0;
  if (horasRest > 0 && horasRest < 50 && !prioridad) prioridad = 'preventiva';
  if (horasRest > 0 && horasRest < 50) {
    const ha = equipo.horas_actuales || 0;
    acciones.push({
      tipo:'mantenimiento', icono:'🔧',
      descripcion:`Programar mantenimiento (restan ${horasRest.toFixed(0)} horas)`,
      contexto:`Próximo servicio: ${(ha+horasRest).toLocaleString('es-PE')} horas`
    });
  }

  // 12) DTC Mediana
  const dtcMed = (equipo.dtc || []).filter(d => d.severidad === 'Mediana');
  if (dtcMed.length && !prioridad) prioridad = 'preventiva';
  // dtcMed.forEach(d => acciones.push({
  //   tipo:'dtc_mediano', icono:'⚠️',
  //   descripcion:`Monitorear código: ${d.descripcion_corta || d.codigo || 'Código'}`,
  //   contexto:`Frecuencia: ${d.repeticiones || 0} ocurrencias`
  // }));

  if (!acciones.length || !prioridad) return null;
  return { prioridad, acciones };
}

function _acc_diasSinConexion(ult) {
  if (!ult) return 999;
  try {
    const f = new Date(ult);
    const hoy = new Date();
    return Math.floor((hoy - f) / (1000*60*60*24));
  } catch (e) { return 999; }
}

function _acc_calcularImpactoRalenti(equipo) {
  const horasTotales = equipo.horas_totales || 0;
  const exceso = equipo.percent_exces_ralent_horas || 0;
  const horasExceso = horasTotales * exceso;
  const costoHora = 5.20;
  return horasExceso * costoHora;
}

function _acc_generarSeccionPrioridad(items, prioridad) {
  let titulo='', icono='';
  if (prioridad==='critica')    { titulo='EQUIPOS QUE REQUIEREN ACCIONES INMEDIATAS'; icono='🔴'; }
  else if (prioridad==='alta')  { titulo='EQUIPOS QUE REQUIEREN ATENCIÓN PRIORITARIA'; icono='🟠'; }
  else                          { titulo='ACCIONES PREVENTIVAS RECOMENDADAS';         icono='🔵'; }

  const count = items.length, eqTxt = count===1?'equipo':'equipos';
  let html = `
    <div class="acciones-section-header">
      <h3 class="acciones-section-title">${icono} ${titulo} (${count} ${eqTxt})</h3>
    </div>
  `;
  items.forEach(it => { html += _acc_tarjetaAccion(it.equipo, it.acciones); });
  return html;
}

function _acc_tarjetaAccion(equipo, acciones) {
  const familia = equipo.familia || 'SIN CLASIFICAR';
  const modelo  = equipo.modelo || '-';
  const numInt  = equipo.num_interno || '-';
  const serie   = equipo.id_equipo || equipo.pin || '-';
  const asesor  = equipo.asesor || 'Sin asignar';
  const suc     = equipo.sucursal || '-';

  const accionesHtml = (acciones||[]).map(a => `
    <div class="accion-item">
      <div class="accion-descripcion">${a.icono} • ${a.descripcion}</div>
      <div class="accion-contexto">${a.contexto}</div>
    </div>
  `).join('');

  return `
    <div class="accion-tarjeta">
      <div class="accion-tarjeta-header">
        <h4 class="accion-equipo-titulo">${familia} - ${modelo} - ${numInt}</h4>
        <span class="accion-equipo-serie">Serie: ${serie}</span>
      </div>
      <div class="accion-tarjeta-body">
        <h5 class="accion-subtitulo">🚨 ACCIONES REQUERIDAS:</h5>
        ${accionesHtml}
      </div>
      <div class="accion-tarjeta-footer">
        <span class="accion-asesor">👤 Asesor: ${asesor} - ${suc}</span>
      </div>
    </div>
  `;
}

function _acc_obtenerAsesoresUnicos(items) {
  const map = {};
  (items || []).forEach(it => {
    const eq = it.equipo || {};
    const nombre = eq.asesor || 'Sin asignar';
    if (!map[nombre]) {
      map[nombre] = {
        nombre,
        correo: eq.asesor_correo || 'administrativo.sir@ipesa.com.pe',
        celular: eq.asesor_celular || '-',
        sucursal: eq.sucursal || '-'
      };
    }
  });
  return Object.values(map);
}

function _acc_generarTablaContactosAsesores(asesores) {
  if (!asesores || !asesores.length) return '';
  const filas = asesores.map(a => `
    <tr class="contacto-fila">
      <td class="contacto-nombre">${a.nombre}</td>
      <td class="contacto-correo">${a.correo}</td>
      <td class="contacto-celular">${a.celular}</td>
      <td class="contacto-sucursal">${a.sucursal}</td>
    </tr>
  `).join('');
  return `
    <div class="acciones-contactos">
      <h3 class="contactos-titulo">📞 DATOS DE CONTACTO DE ASESORES IPESA</h3>
      <p class="contactos-intro">Para consultas sobre las acciones recomendadas, contacte directamente al asesor asignado:</p>
      <table class="contactos-tabla">
        <thead>
          <tr class="contacto-header-row">
            <th class="contacto-th">Asesor</th>
            <th class="contacto-th">Correo</th>
            <th class="contacto-th">Celular</th>
            <th class="contacto-th">Sucursal</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `;
}

function _acc_generarMensajeSinAcciones(periodo) {
  return `
    <div class="page page-acciones">
      <style>
        .page-acciones{background:#fff;padding:50px 70px;page-break-after:always;font-family:Arial,sans-serif;box-sizing:border-box;}
        .page-acciones .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:15px;border-bottom:3px solid #f57c00;}
        .page-acciones .section-header h2{margin:0;color:#f57c00;font-size:24px;font-weight:700;}
        .page-acciones .btn-volver{color:#3182ce;text-decoration:none;font-size:13px;font-weight:600;}
        .page-acciones .periodo-text{font-size:13px;color:#666;margin:10px 0 18px;}
        .page-acciones .acciones-status-positive{background:#e8f5e9;border:2px solid #66bb6a;border-radius:8px;padding:28px;text-align:center;margin-top:18px;}
        .page-acciones .status-icon-large{font-size:44px;margin-bottom:12px;}
        .page-acciones .status-title{margin:0 0 12px;color:#2e7d32;font-size:18px;font-weight:700;}
        .page-acciones .status-message{font-size:14px;color:#424242;margin-bottom:14px;font-weight:600;}
        .page-acciones .status-description{font-size:13px;color:#424242;margin-bottom:10px;}
        .page-acciones .status-benefits{text-align:left;display:inline-block;margin:0;padding-left:18px;}
        .page-acciones .status-benefits li{font-size:13px;color:#424242;margin-bottom:6px;line-height:1.55;}
      </style>
      <div class="header">
        <h1>💡 ACCIONES Y RECOMENDACIONES</h1>
        <div class="header-subtitle">Periodo: del ${_acc_fmt(periodo.inicio)} al ${_acc_fmt(periodo.fin)}</div>
      </div>
      <div class="acciones-status-positive">
        <div class="status-icon-large">✅</div>
        <h3 class="status-title">Operación Óptima de la Flota</h3>
        <p class="status-message">No se identificaron acciones correctivas o preventivas requeridas en este periodo.</p>
        <p class="status-description">Su flota opera dentro de los parámetros esperados, lo que refleja:</p>
        <ul class="status-benefits">
          <li>Conectividad estable en todos los equipos</li>
          <li>Utilización eficiente del tiempo de operación</li>
          <li>Sin códigos de diagnóstico críticos pendientes</li>
          <li>Análisis de fluidos dentro de parámetros normales</li>
          <li>Sin alertas predictivas activas</li>
        </ul>
      </div>
    </div>
  `;
}

/* Formato fechas dd-Mes-aaaa */
function _acc_fmtFecha(fecha) {
  if (!fecha) return '-';
  try {
    const d = (typeof fecha === 'string') ? new Date(fecha) : fecha;
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const dd = String(d.getDate()).padStart(2,'0');
    return `${dd}-${meses[d.getMonth()]}-${d.getFullYear()}`;
  } catch(e) { return '-'; }
}

/* Normaliza string ya dd-mm-aaaa (o vacío) */
function _acc_fmt(s) { return s || '-'; }



function _pickInt(o, keys) {
  if (!o) return 0;
  for (const k of keys) {
    const n = Number(o[k]);
    if (!isNaN(n) && n !== Infinity && n !== -Infinity) return Math.max(0, Math.floor(n));
  }
  return 0;
}
function _sumInt(vals) {
  return vals.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

