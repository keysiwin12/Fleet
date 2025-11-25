/**************************************
 * 📄 FUNCIONES getRaw*
 **************************************/
const hojaConfig = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CONFIG");
const config = {
  precio_galon: hojaConfig.getRange("C2").getValue(),
  fecha_inicio: hojaConfig.getRange("A2").getValue(),
  fecha_fin: hojaConfig.getRange("B2").getValue(),
  img_cabecera_correo : "1iUZYQoWBuma9dCNlsQOXUy0EJpeMxWjh",
  img_pie_correo : "1JxcYdB7ZFHZi1CGk5SgVtoB6ir74rnbF"
};


const hojaSeguimiento = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("LOG_ENVIOS");


// 🔹 CLIENTES
function getRawClientes() {
  const data = readSheetAsObjects("Z_CLIENTES", obj => {
    // Ignorar clientes sin ID o sin alertas
    if (!obj.id_cliente || String(obj.id_cliente).trim() === "") return null;
    return {
      id_op_center: String(obj.id_op_center || "").trim(),
      id_cliente: String(obj.id_cliente || "").trim(),
      razon_social: String(obj.razon_social || "").trim(),
      nif: String(obj.nif || "").trim(),
      es_cbd: obj.es_cbd === true || obj.es_cbd === "TRUE",
      es_signature: obj.es_signature === true || obj.es_signature === "TRUE",
    };
  });

  // Indexar por id_op_center
  const clientes = {};
  data.forEach(c => {
    if (c.id_op_center) clientes[c.id_op_center] = c;
  });
  return clientes;
}

// 🔹 ASESORES
function getRawAsesores() {
  const data = readSheetAsObjects("Z_ASESORES");
  const asesores = {};
  data.forEach(r => {
    const id = String(r.id_asesor || "").trim();
    if (!id) return;
    asesores[id] = {
      nombre_completo: String(r.nombre_completo || "").trim(),
      email: String(r.email || "").trim(),
      sucursal: String(r.sucursal || "").trim(),
      celular: String(r.celular || "").trim(),
    };
  });
  return asesores;
}

// 🔹 EQUIPOS
function getRawEquipos() {
  const data = readSheetAsObjects("Z_EQUIPOS");
  const equipos = {};
  data.forEach(r => {
    const serie = String(r.id_equipo || "").trim();
    if (!serie) return;
    equipos[serie] = {
      id_modelo: String(r.id_modelo || "").trim(),
    };
  });
  return equipos;
}

// 🔹 CARTERA
function getRawCartera() {
  const data = readSheetAsObjects("CARTERA");
  const cartera = {};
  data.forEach(r => {
    const serie = String(r.id_equipo || "").trim();
    if (!serie) return;
    cartera[serie] = {
      id_asesor: String(r.id_asesor || "").trim(),
      id_sucursal: String(r.id_sucursal || "").trim(),
    };
  });
  return cartera;
}

// 🔹 OPERACIÓN (solo columnas clave)
function getRawOperacion() {
  const data = readSheetAsObjects("OPERACION", obj => {
    if (!obj.id_equipo) return null;
    return {
      fecha_inicio : obj.fecha_inicio,
      fecha_fin : obj.fecha_fin,
      id_equipo: String(obj.id_equipo || "").trim(),
      id_cliente_oc: String(obj.id_cliente_oc || "").trim(),
      modelo: String(obj.modelo || "").trim(),
      linea: String(obj.linea || "").trim(),
      familia: String(obj.familia || "").trim(),
      num_interno: String(obj.num_interno || "").trim(),
      ult_conexion: obj.ult_conexion || "",
      latitud: obj.latitud || "",
      longitud: obj.longitud || "",
      horas_trabajo_motor_vida_util: Number(obj.horas_trabajo_motor_vida_util) || 0,
      prox_mto: Number(obj.prox_mto) || 0,
      horas_restantes: Number(obj.horas_restantes) || 0,
      aviso: obj.aviso === true || obj.aviso === "TRUE",
      horas_total_general: Number(obj.horas_total_general) || 0,
      horas_funcionamiento_general: Number(obj.horas_funcionamiento_general) || 0,
      horas_ralenti_general: Number(obj.horas_ralenti_general) || 0,
      percent_ralent_horas : Number(obj.percent_ralent_horas) || 0,
      percent_exces_ralent_horas : Number(obj.percent_exces_ralent_horas || 0),
      comb_perdido_ral : Number(obj.comb_perdido_ral || 0),
      impacto_economico_ral : Number(obj.impacto_economico_ral || 0),
      comb_total_general: Number(obj.comb_total_general) || 0,
      comb_prom_general: Number(obj.comb_prom_general) || 0,
    };
  });

  const operacion = {};
  data.forEach(o => (operacion[o.id_equipo] = o));
  return operacion;
}

// 🔹 TAXONOMÍA
function getRawTaxonomia() {
  const data = readSheetAsObjects("Z_TAXONOMIA");
  const taxonomia = {};
  data.forEach(r => {
    const id = String(r.id_modelo || "").trim();
    if (!id) return;
    taxonomia[id] = {
      linea: String(r.linea || "").trim(),
      familia: String(r.familia || "").trim(),
    };
  });
  return taxonomia;
}

// 🔹 SUCURSALES
function getRawSucursales() {
  return readSheetAsObjects("Z_SUCURSALES");
}

function getRawConfig() {
  return readSheetAsObjects("CONFIG");
}


// 🔹 CONTACTOS
function getRawContactos() {
  const data = readSheetAsObjects("Z_CONTACTOS_CLIENTE");
  const contactos = {};
  data.forEach(r => {
    const idCliente = String(r.id_cliente || "").trim();
    if (!idCliente) return;
     // ⚙️ Normalizar el valor booleano
    const esCSC = r.contacto_csc === true || r.contacto_csc === "TRUE";
    // 🚫 Si no está marcado para CSC, ignorar
    if (!esCSC) return;
    if (!contactos[idCliente]) contactos[idCliente] = [];
    contactos[idCliente].push({
      cargo: String(r.cargo || "").trim(),
      nombre: String(r.nombre || "").trim(),
      correo: String(r.correo || "").trim(),
      celular: String(r.celular || "").trim(),
      contacto_csc: r.contacto_csc === true || r.contacto_csc === "TRUE",
    });
  });
  return contactos;
}


// 🔹 DTC
function getRawDTC() {
  const data = readSheetAsObjects("DTC", obj => {
    if (!obj.id_equipo) return null;

    const lat = Number(obj.latitud) || 0;
    const lon = Number(obj.longitud) || 0;

    // Solo crear enlace si hay coordenadas válidas
    const ubicacion =
      lat !== 0 && lon !== 0
        ? `https://www.google.com/maps?q=${lat},${lon}`
        : "";

    return {
      id_equipo: String(obj.id_equipo || "").trim(),
      fecha: obj.fecha || "",
      repeticiones : obj.repeticiones_dia,
      severidad: String(obj.severidad || "").trim(),
      descripcion: String(obj.codigo_dtc || "").trim(), 
      ubicacion,
    };
  });

  // Agrupar por equipo
  const dtc = {};
  data.forEach(d => {
    if (!dtc[d.id_equipo]) dtc[d.id_equipo] = [];
    dtc[d.id_equipo].push({
      fecha: d.fecha,
      repeticiones : d.repeticiones,
      severidad: d.severidad,
      descripcion : d.descripcion
    });
  });
  return dtc;
}

// 🔹 EXPERT ALERTS
function getRawEA() {
  const data = readSheetAsObjects("EA", obj => {
    if (!obj.id_equipo) return null;
    return {
      id_equipo: String(obj.id_equipo || "").trim(),
      fecha: obj.fecha || "",
      severidad: String(obj.severidad_traducida || "").trim(),
      estado: String(obj.status_traducido || "").trim(),
      descripcion: String(obj.descripcion_traducida || "").trim(),
    };
  });

  //agrupar por equipo
  const ea = {};
  data.forEach(e => {
    if (!ea[e.id_equipo]) ea[e.id_equipo] = [];
    ea[e.id_equipo].push({
      fecha: e.fecha,
      severidad: e.severidad,
      estado: e.estado,
      descripcion: e.descripcion,
    });
  });
  return ea;
}

// 🔹 ACEITE
function getRawAceite() {
  const data = readSheetAsObjects("ACEITE", obj => {
    if (!obj.id_equipo) return null;
    return {
      id_equipo: String(obj.id_equipo || "").trim(),
      tipo: String(obj.tipo || "").trim(),
      muestra: String(obj.muestra || "").trim(),
      resultado: String(obj.resultado_muestra || "").trim(),
      compartimiento: String(obj.compartimiento || "").trim(),
      pdf: String(obj.pdf || "").trim()
    };
  });

  //agrupar por equipo
  const aceite = {};
  data.forEach(a => {
    if (!aceite[a.id_equipo]) aceite[a.id_equipo] = [];
    aceite[a.id_equipo].push({
      tipo: a.tipo,
      muestra: a.muestra,
      resultado: a.resultado,
      compartimiento: a.compartimiento,
      pdf: a.pdf
    });
  });
  return aceite;
}


function buildDataModel() {
  console.log("🚀 Cargando datos base...");

  // 🔹 Cargar todas las tablas
  const clientes = getRawClientes();     // indexado por id_op_center
  const asesores = getRawAsesores();     // indexado por id_asesor
  const equipos = getRawEquipos();       // indexado por id_equipo
  const cartera = getRawCartera();       // indexado por id_equipo
  const operacion = getRawOperacion();   // indexado por id_equipo
  const taxonomia = getRawTaxonomia();   // indexado por id_modelo
  const sucursales = getRawSucursales(); // array
  const contactos = getRawContactos();   // agrupado por id_cliente (filtrado contacto_csc = TRUE)
  const dtc = getRawDTC();               // agrupado por id_equipo
  const expalert = getRawEA();           // agrupado por id_equipo
  const aceite = getRawAceite();         // agrupado por id_equipo
  const configData = getRawConfig();     // fechas inicio / fin

  console.log("⚙️ Construyendo relaciones e índices...");

  // 🚀 OPTIMIZACIÓN: Generar índice de num_informe UNA SOLA VEZ
  const indiceNumInformes = generarIndiceNumInformes(hojaSeguimiento);

  // 📍 Crear índice rápido de sucursales
  // cambiar a la funcion de arriba
  const sucursalesIndex = {};
  sucursales.forEach(s => {
    const id = String(s.id_sucursal || "").trim();
    if (id) sucursalesIndex[id] = s;
  });

  // 📍 Configuración y Periodo
  let config = {};
  let periodo = null;

  if (configData && configData.length > 0) {
    const cfg = configData[0];
    const fechaInicio = cfg.fecha_inicio ? new Date(cfg.fecha_inicio) : null;
    const fechaFin = cfg.fecha_fin ? new Date(cfg.fecha_fin) : null;

    config = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      precio_galon: cfg.precio_galon || 4.2  // ✅ Valor por defecto
    };

    // 🗓️ Crear objeto periodo con múltiples formatos
    if (fechaInicio && fechaFin) {
      periodo = {
        // Formato corto para secciones (dd-MM-yy)
        inicio: Utilities.formatDate(fechaInicio, "America/Lima", "dd-MM-yy"),
        fin: Utilities.formatDate(fechaFin, "America/Lima", "dd-MM-yy"),

        // Formato largo para emails (dd/MM/yyyy)
        inicioLargo: Utilities.formatDate(fechaInicio, "America/Lima", "dd/MM/yyyy"),
        finLargo: Utilities.formatDate(fechaFin, "America/Lima", "dd/MM/yyyy"),

        // Objetos Date originales para cálculos
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,

        // Objetos Date para portada (usado en renderPortada2Paginas)
        inicioDate: fechaInicio,
        finDate: fechaFin,

        // Label legible para chips
        label: `${Utilities.formatDate(fechaInicio, "America/Lima", "dd/MM/yy")} — ${Utilities.formatDate(fechaFin, "America/Lima", "dd/MM/yy")}`
      };
    }
  }

  const clientes_por_opcenter = {};  // ← AGREGAR ESTA LÍNEA

  // 🔹 Procesar cada equipo
  for (const serie in equipos) {
    const eq = equipos[serie];
    const op = operacion[serie];
    if (!op) continue; // sin datos de operación → ignorar
    

    const idOpCenter = String(op.id_cliente_oc || "").trim();
    if (!idOpCenter || !clientes[idOpCenter]) continue; // cliente inexistente → ignorar

    // 🧩 Datos relacionados
    const tax = taxonomia[eq.id_modelo] || {};
    const car = cartera[serie] || {};
    const asesor = asesores[car.id_asesor] || null;
    const suc = sucursalesIndex[car.id_sucursal] || {};

    const dtcEquipo = dtc[serie] || [];
    const eaEquipo = expalert[serie] || [];
    const acEquipo = aceite[serie] || [];

    // 🧱 Enriquecer equipo
    const equipoFinal = {
      ...eq,
      ...tax,
      ...op,
      id_op_center: idOpCenter,
      asesor: asesor ? asesor.nombre_completo : null,
      asesor_email: asesor ? asesor.email : null,
      asesor_celular: asesor ? asesor.celular : null,
      asesor_sucursal: asesor ? asesor.sucursal : null,
      sucursal: suc.sucursal || null,
      correo_sucursal: suc.correo_sucursal || null,
      dtc: dtcEquipo,
      ea: eaEquipo,
      ac: acEquipo,
    };

    equipos[serie] = equipoFinal;

    // 🧩 Crear cliente si aún no existe (solo si tiene contactos CSC válidos)
    let clienteObj = clientes_por_opcenter[idOpCenter];

    if (!clienteObj) {
      const cli = clientes[idOpCenter];
      const contactosCliente = contactos[cli.id_cliente] || [];

      // 🚫 Si no tiene contactos CSC válidos → omitir
      if (contactosCliente.length === 0) continue;

      // ✅ Crear estructura del cliente
      clienteObj = {
        id_op_center: idOpCenter,
        id_cliente: cli.id_cliente,
        razon_social: cli.razon_social,
        nif: cli.nif,
        es_cbd: cli.es_cbd,
        es_signature: cli.es_signature,
        contactos: contactosCliente,
        num_informe: numinformeDesdeIndice(idOpCenter, indiceNumInformes), // 🚀 OPTIMIZADO: Usa índice
        equipos: [],
        asesores: {},
      };

      clientes_por_opcenter[idOpCenter] = clienteObj;
    }

    // 🧩 Agregar equipo enriquecido al cliente
    clienteObj.equipos.push(equipoFinal);

    // 🧩 Registrar asesor si aplica
    if (asesor) {
      const idAsesor = car.id_asesor;
      const asesoresCliente = clienteObj.asesores;
      if (!asesoresCliente[idAsesor]) {
        asesoresCliente[idAsesor] = {
          nombre_completo: asesor.nombre_completo,
          email: asesor.email,
          sucursal: asesor.sucursal,
          celular: asesor.celular,
        };
      }
    }
  }


  // 🧾 Retornar modelo final
  return {
    config,
    periodo,  // ✅ Objeto periodo formateado desde CONFIG
    clientes,
    contactos,
    dtc,
    expalert,
    aceite,
    relaciones: {
      clientes_por_opcenter,
    },
  };
}


function calcularMetricasCliente(equipos, precioPorGalon) {
  // acumuladores
  let totalEquipos = 0;
  let conectados15d = 0;
  let equipos_trabajando= 0;
  let mantProx = 0;
  let excesoRalentiEquipos = 0;

  let horasRalenti = 0;
  let horasMotor = 0;
  let combPerdido = 0;
  let impactoUSD = 0;

  let dtcAlta = 0, dtcMedia = 0, dtcInfo = 0;
  let eaCritica = 0, eaAlta = 0, eaAltaRendimiento = 0, eaInformativa = 0;
  let acNormal = 0 , acPreacaucion =0 , acAnormal =0;
  let lineaCF = 0 , lineaAF =0 , lineaW =0 , lineaOtros =0;
  
  equipos.forEach(eq => {
    totalEquipos++;
    // 🔹 Conectividad (últimos 15 días)
    if (estaConectadoUltimosDias(eq.ult_conexion, 15))  {
      conectados15d++;
      if (eq.aviso === true) mantProx++;
    }
    
    if (eq.percent_ralent_horas) {
      equipos_trabajando++;
    }

    if(eq.linea == "JD C&F") {
      lineaCF++;
    }
    else if(eq.linea == "JD A&T") {
      lineaAF++;
    }
    else if(eq.linea == "WIRTGEN GROUP") {
      lineaW++;
    }
    else {
      lineaOtros++;
    }

    

    // ralentí / combustible / impacto
    horasRalenti += numSeguro(eq.horas_ralenti_general);
    horasMotor   += numSeguro(eq.horas_total_general);
    combPerdido  += numSeguro(eq.comb_perdido_ral);
    impactoUSD   += numSeguro(eq.impacto_economico_ral);

    // exceso de ralentí (umbral 15%)
    if (numSeguro(eq.percent_exces_ralent_horas)) excesoRalentiEquipos++;

    // DTC por severidad
    if (Array.isArray(eq.dtc)) {
      eq.dtc.forEach(d => {
        if (d.severidad === 'Alta') dtcAlta++;
        else if (d.severidad === 'Mediana') dtcMedia++;
        else dtcInfo++;
      });
    }

    // Expert Alerts
    if (Array.isArray(eq.ea)) {
      eq.ea.forEach(a => {
        if (a.severidad === 'Crítica') eaCritica++;
        else if (a.severidad === 'Alta') eaAlta++;
        else if (a.severidad === 'Alta-Rendimiento') eaAltaRendimiento++;
        else if (a.severidad === 'Informativa') eaInformativa++;
      });
    }

    if (Array.isArray(eq.ac)) {
      eq.ac.forEach(ac => {
        if (ac.resultado == 'Precaución') acPreacaucion++;
        else if (ac.resultado == 'Normal') acNormal++;
        else if (ac.resultado == 'Anormal') acAnormal++;
      });
    }
  });

  // porcentajes & promedios seguros
  const pct = (num, den) => den > 0 ? ((num / den) * 100).toFixed(0) : '0';
  const pct1 = (num, den) => den > 0 ? ((num / den) * 100).toFixed(1) : '0.0';

  const metricas = {
    totales: {
      totalEquipos,
      conectados15d,
      mantProxLt50h: mantProx,
      equiposTrabajando : equipos_trabajando,
      equiposExcesoRalenti: excesoRalentiEquipos,

      horasRalenti: Number(horasRalenti.toFixed(2)),
      horasMotor: Number(horasMotor.toFixed(2)),
      combPerdidoGal: Number(combPerdido.toFixed(0)),
      impactoEstimadoUSD: Number(impactoUSD.toFixed(0)),
    },
    porcentajes: {
      conectadas: pct(conectados15d, totalEquipos),
      mantenimiento: pct(mantProx, conectados15d),
      excesoRalenti: pct(excesoRalentiEquipos, equipos_trabajando),
      ralentiFlota: pct1(horasRalenti, horasMotor),
    },
    promediosPorEquipo: {
      horasRalenti: equipos_trabajando> 0 ? Number((horasRalenti / equipos_trabajando).toFixed(1)) : 0,
      combPerdidoGal: equipos_trabajando > 0 ? Number((combPerdido / equipos_trabajando).toFixed(1)) : 0,
      impactoEstimadoUSD: equipos_trabajando > 0 ? Number((impactoUSD / equipos_trabajando).toFixed(0)) : 0,
    },
    economico: {
      precioPorGalon: Number(precioPorGalon),
      perdidaUSD_por_combustible: Number((combPerdido * Number(precioPorGalon)).toFixed(0)),
      perdidaUSD_por_equipo: equipos_trabajando > 0
        ? Number(((combPerdido * Number(precioPorGalon)) / equipos_trabajando).toFixed(0))
        : 0,
    },
    dtc: {
      alta: dtcAlta,
      media: dtcMedia,
      info: dtcInfo,
      total: dtcAlta + dtcMedia + dtcInfo,
    },
    expertAlerts: {
      critica: eaCritica,
      alta: eaAlta,
      informativa:eaInformativa,
      alta_rendimiento: eaAltaRendimiento,
      total: eaCritica + eaAlta + eaInformativa + eaAltaRendimiento,
    },

    aceite: {
      normal: acNormal,
      precaucion: acPreacaucion,
      anormal: acAnormal,
    },

    distribucionLineas: {
      lineaCF : lineaCF,
      lineaAF : lineaAF,
      lineaW : lineaW,
      lineaOtros : lineaOtros
    }
  };

  return metricas;
}


function addMetricasClientes(modelo, precioPorGalon) {
  console.log("📊 Calculando métricas por cliente...");

  const clientes = modelo.relaciones?.clientes_por_opcenter || {};
  let clientesConMetricas = 0;
  let equiposProcesados = 0;

  for (const idOpCenter in clientes) {
    const cliente = clientes[idOpCenter];
    // equipos ya enriquecidos
    const equiposCliente = Array.isArray(cliente.equipos) ? cliente.equipos : [];
    if (equiposCliente.length === 0) continue;

    const metricas = calcularMetricasCliente(equiposCliente, precioPorGalon);
    cliente.metricas = metricas;

    clientesConMetricas++;
    equiposProcesados += equiposCliente.length;
  }

  console.log(`✅ Métricas añadidas a ${clientesConMetricas} clientes (${equiposProcesados} equipos procesados).`);
  return modelo;
}



function generarModeloConMetricas() {
  console.log("🚀 Construyendo modelo base...");
  const modelo = buildDataModel();
  console.log("📊 Agregando métricas por cliente...");
  const modeloMetricas = addMetricasClientes(modelo, modelo.config.precio_galon);
  console.log("✅ Modelo completo generado con métricas.");
  return modeloMetricas;
}


function pruebaModeloConMetricas() {
  const modelo = generarModeloConMetricas();
  const json = JSON.stringify(modelo.relaciones.clientes_por_opcenter, null, 2);
  const file = DriveApp.createFile("clientes_metricas.json", json, MimeType.PLAIN_TEXT);
  Logger.log("📁 Archivo generado con métricas: " + file.getUrl());
}

