/**************************************
 * 🧠 FUNCIÓN BASE DE LECTURA
 **************************************/
function readSheetAsObjects(sheetName, transformer = null) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh) {
    console.warn(`⚠️ No se encontró la hoja: ${sheetName}`);
    return [];
  }

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];

  // ⚡ Solo leer rango útil (no toda la hoja)
  const values = sh.getRange(1, 1, lastRow, lastCol).getValues();

  const headers = values[0].map(h => String(h).trim());
  const rows = values.slice(1);

  const data = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.some(c => c !== "" && c != null)) continue; // ignora filas vacías

    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = r[j];
    }

    if (transformer) {
      const transformed = transformer(obj, headers);
      if (transformed) data.push(transformed);
    } else {
      data.push(obj);
    }
  }

  return data;
}

function estaConectadoUltimosDias(fecha, dias = 15) {
  if (!fecha) return false;

  const hoy = new Date();
  const limite = new Date(hoy.getTime() - dias * 24 * 60 * 60 * 1000);
  const f = new Date(fecha);

  return !isNaN(f.getTime()) && f >= limite;
}

function numSeguro(v) {
  return (typeof v === 'number' && !isNaN(v))
    ? v
    : (parseFloat(String(v).replace(',', '.')) || 0);
}


// 📦 Convierte una imagen de Drive a Base64
function getBase64ImageFromDrive(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    return base64;
  } catch (error) {
    Logger.log('Error al obtener imagen de Drive: ' + error);
    return null;
  }
}

// 🎯 Carga todos los logos e imágenes requeridas para el PDF
function cargarLogosBase64() {
  return {
    logoIpesa: getBase64ImageFromDrive("1OCebW4tVJlwSiln4mXOIaz9pi_tzSuz9"),
    logoCSC: getBase64ImageFromDrive("1LuOwO1VttPC3-cqBQE3_eWmFlxUL599M"),
    fleetAssurance: getBase64ImageFromDrive("1yiZ1LjqMdd9NA3pn2Bbm5OtBW4ph0EPW"),
    imagenInstitucional: getBase64ImageFromDrive("1Pjl60dPKqRQHlMT5gwzvJRHMx7uhwZVP"),
    leyendaRojo: getBase64ImageFromDrive("1MDJB4AwzaMhyyqhfXJF5JoNggQpc8Sj-"),
    leyendaAmarillo: getBase64ImageFromDrive("11pLq-yiMcKCyBP-KvY9Fgii36svXh2-D"),
    leyendaNaranja: getBase64ImageFromDrive("18kpHjee8VRz39-X7evGT8OJH7jVtSbvC"),
    imagenAceite: getBase64ImageFromDrive("1_W2fwyNLTHPSUUx6g6b3u2x6UnPESiVS"),
    modemM: getBase64ImageFromDrive("1YGVRyEOeS3ac_2lZB-vPh3Cp5DpLdJSM"),
    jDProtect: getBase64ImageFromDrive("1PkJ43OgGL7zFKIUnm_Js0F9TwK-hzVYS"),
    // Imágenes promocionales
    imagenPromoModemM: getBase64ImageFromDrive("1YGVRyEOeS3ac_2lZB-vPh3Cp5DpLdJSM"),
    imagenPromoJDProtect: getBase64ImageFromDrive("1PkJ43OgGL7zFKIUnm_Js0F9TwK-hzVYS")
  };
}

// 🗂️ Crea las carpetas para almacenar los reportes semanales (usando el modelo de datos)
function prepararCarpetasSemana(fechaInicio, fechaFin) {
  // 🧭 Validar fechas
  if (!fechaInicio || !fechaFin) {
    throw new Error("❌ Se requieren fechas de inicio y fin.");
  }

  const fechaInicioFmt = Utilities.formatDate(new Date(fechaInicio), "America/Lima", "dd-MM-yy");
  const fechaFinFmt = Utilities.formatDate(new Date(fechaFin), "America/Lima", "dd-MM-yy");

  // 📁 IDs de carpetas raíz (asegúrate de mantener los tuyos correctos)
  const idClientes = "1Z1gK4lo7bwA5d1J2uPBJERCSJgMCAVZy";
  const idCBD = "1f3V48UOWrU_8Ve0HFNo7tO3UES1sSX0g";
  const idSignature = "1w8CgLsuNjc3i0RfVz_V2pSpyMHHLYxDD";

  // 🗂️ Crear subcarpetas por periodo
  const folderClientes = DriveApp.getFolderById(idClientes)
    .createFolder(`Reporte de Gestión de Flota Clientes /${fechaFinFmt} - ${fechaInicioFmt}`);

  const folderCBD = DriveApp.getFolderById(idCBD)
    .createFolder(`Reporte de Gestión de Flota CBD/${fechaFinFmt} - ${fechaInicioFmt}`);

  const folderSignature = DriveApp.getFolderById(idSignature)
    .createFolder(`Reporte de Gestión de Flota Signature/${fechaFinFmt} - ${fechaInicioFmt}`);

  Logger.log(`📁 Carpetas creadas: ${folderClientes.getName()} / ${folderCBD.getName()} / ${folderSignature.getName()}`);

  return {
    clientes: folderClientes,
    cbd: folderCBD,
    signature: folderSignature,
    periodo: {
      inicio: fechaInicioFmt,
      fin: fechaFinFmt
    }
  };
}

function numinforme(idopcenter,hojalogs){
  const datos = hojalogs.getRange(2,2,hojalogs.getLastRow()-1,1).getValues();
  let contador = 0;
  datos.forEach(fila => {
    if (fila[0] === idopcenter) {
      contador++;
      console.log(contador);
    }
  });
  return `${idopcenter}-${contador + 1}`;
}


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
