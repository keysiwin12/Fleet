# 🔍 ANÁLISIS: Problema de Periodo y Precio por Galón

**Fecha**: 7 de Noviembre, 2024
**Problema reportado**: El periodo y precio_galon están divididos, cada archivo maneja sus propios valores

---

## 📊 RESUMEN DEL PROBLEMA

### ❌ Estado Actual
- ❌ Hoja CONFIG **sí contiene** fecha_inicio, fecha_fin y precio_galon
- ❌ `buildDataModel()` **sí lee** estos valores en `modelo.config`
- ❌ **PERO** no expone `modelo.periodo` directamente
- ❌ Cada archivo tiene **valores hardcodeados** con **formatos diferentes**
- ❌ 18 lugares con hardcodeos de periodo
- ❌ 3 lugares con hardcodeos de precio_galon (valores diferentes: 3.75, 4.2)

### ✅ Estado Deseado
- ✅ CONFIG es la **única fuente de verdad**
- ✅ `modelo.periodo` accesible directamente
- ✅ `modelo.config.precio_galon` usado en todas partes
- ✅ **Un solo formato** de fecha consistente
- ✅ **Cero hardcodeos**

---

## 🔍 ANÁLISIS DETALLADO

### 1. ¿Qué contiene la hoja CONFIG?

**data.js líneas 145-147**
```javascript
function getRawConfig() {
  return readSheetAsObjects("CONFIG");
}
```

**data.js líneas 296-305** - Lo que SÍ se lee correctamente:
```javascript
// 📍 Configuración
let config = {};
if (configData && configData.length > 0) {
  const cfg = configData[0];
  config = {
    fecha_inicio: cfg.fecha_inicio ? new Date(cfg.fecha_inicio) : null,  // ✅ SÍ se lee
    fecha_fin: cfg.fecha_fin ? new Date(cfg.fecha_fin) : null,            // ✅ SÍ se lee
    precio_galon: cfg.precio_galon                                        // ✅ SÍ se lee
  };
}
```

**data.js líneas 392-402** - Lo que retorna buildDataModel():
```javascript
return {
  config,          // ✅ Contiene fecha_inicio, fecha_fin, precio_galon
  clientes,
  contactos,
  dtc,
  expalert,
  aceite,
  relaciones: {
    clientes_por_opcenter,
  },
  // ❌ NO hay "periodo" aquí
};
```

**❌ PROBLEMA**: `modelo.periodo` NO existe, pero todo el código trata de usarlo.

---

### 2. ¿Dónde se usa el periodo? (18 ubicaciones)

#### ✅ CORRECTO - Un solo archivo lo hace bien

**prueba.js:3209-3214** (único lugar que lo hace correctamente):
```javascript
if (modelo.config?.fecha_inicio && modelo.config?.fecha_fin) {
  periodo = {
    inicio: Utilities.formatDate(new Date(modelo.config.fecha_inicio), "America/Lima", "dd-MM-yy"),
    fin: Utilities.formatDate(new Date(modelo.config.fecha_fin), "America/Lima", "dd-MM-yy")
  };
}
```

#### ❌ INCORRECTO - Todos los demás archivos

**generar_pdf.js - 9 hardcodeos**:

| Línea | Código | Valor Hardcodeado |
|-------|--------|-------------------|
| 216 | `periodo : { ini: '2025-10-01', fin: '2025-10-30' }` | ISO format |
| 232 | `renderGraficosConectividad(..., modelo.periodo)` | undefined |
| 233 | `renderUtilizacion(..., modelo.periodo)` | undefined |
| 246 | `periodo: { ini: modelo.periodo?.inicio \|\| modelo.periodo?.fecha_inicio, ... }` | undefined → fallback |
| 252 | `inicio: ... \|\| "2025-10-01"` | ISO format |
| 253 | `fin: ... \|\| "2025-10-30"` | ISO format |
| 265 | `inicio: ... \|\| "01-10-25"` | dd-MM-yy format ⚠️ |
| 266 | `fin: ... \|\| "30-10-25"` | dd-MM-yy format ⚠️ |
| 274-275 | `inicio: ... \|\| "01-10-25", fin: ... \|\| "30-10-25"` | dd-MM-yy format ⚠️ |
| 292 | `modelo.periodo \|\| { inicio: "01-10-25", fin: "30-10-25" }` | dd-MM-yy format ⚠️ |

**prueba.js - 14 hardcodeos**:

| Línea | Código | Valor Hardcodeado |
|-------|--------|-------------------|
| 22-23 | `inicio: modelo.periodo?.fecha_inicio \|\| "01-10-25"` | dd-MM-yy |
| 264-265 | `inicio: modelo.periodo?.fecha_inicio \|\| "01-10-25"` | dd-MM-yy |
| 702-703 | `inicio: modelo.periodo?.fecha_inicio \|\| "01-10-25"` | dd-MM-yy |
| 1428-1429 | `inicio: modelo.periodo?.fecha_inicio \|\| "01-10-25"` | dd-MM-yy |
| 2460-2461 | `inicio: modelo.periodo?.fecha_inicio \|\| "01-10-25"` | dd-MM-yy |
| 2892-2893 | `inicio: modelo.periodo?.fecha_inicio \|\| "01-10-25"` | dd-MM-yy |
| 3207 | `let periodo = { inicio: "01-10-25", fin: "28-10-25" };` | dd-MM-yy |

**⚠️ INCONSISTENCIA CRÍTICA**:
- Algunos lugares usan formato `"2025-10-01"` (ISO)
- Otros usan formato `"01-10-25"` (dd-MM-yy)
- ¡Incluso diferente fecha de fin! (28 vs 30)

---

### 3. ¿Dónde se usa precio_galon? (5 ubicaciones)

#### ✅ CORRECTO - Dos lugares lo hacen bien

**data.js:585**:
```javascript
const modeloMetricas = addMetricasClientes(modelo, config.precio_galon);  // ✅ Usa config
```

**generar_pdf.js:345-346** (en generarHTMLCorreo):
```javascript
const fechaInicio = Utilities.formatDate(new Date(config.fecha_inicio), ...);  // ✅ Usa config
const fechaFin = Utilities.formatDate(new Date(config.fecha_fin), ...);
```

#### ❌ INCORRECTO - Valores hardcodeados

**main.js:3**:
```javascript
const precioPorGalon = 3.75;  // ❌ Hardcodeado (valor DIFERENTE)
```

**pdf-sections.js:293**:
```javascript
const precioPorGalon = 4.2;  // ❌ Hardcodeado
```

**graficos.js:690**:
```javascript
const precioPorGalon = 4.2;  // ❌ Hardcodeado
```

**⚠️ INCONSISTENCIA CRÍTICA**:
- main.js usa **3.75**
- pdf-sections.js y graficos.js usan **4.2**
- ¡Diferencia de 12%! Afecta todos los cálculos económicos

---

## 📈 IMPACTO DEL PROBLEMA

### Inconsistencias de Datos
1. **Periodo diferente en cada reporte**
   - Portada puede mostrar una fecha
   - Secciones internas pueden mostrar otra
   - Usuario ve información contradictoria

2. **Cálculos económicos incorrectos**
   - 12% de diferencia en precio ($3.75 vs $4.2)
   - Reportes muestran pérdidas incorrectas
   - Métricas de ahorro inexactas

3. **Mantenibilidad imposible**
   - Para cambiar periodo: 18 lugares a modificar
   - Para cambiar precio: 3 lugares a modificar
   - Alto riesgo de olvidar alguno

4. **Confusión de formato**
   - ISO: "2025-10-01"
   - dd-MM-yy: "01-10-25"
   - dd/MM/yyyy: "01/10/2025"
   - Bugs de parsing de fechas

---

## ✅ SOLUCIÓN PROPUESTA

### Fase 1: Centralizar en buildDataModel()

**Modificar data.js líneas 296-305**:

```javascript
// ANTES (líneas 296-305)
let config = {};
if (configData && configData.length > 0) {
  const cfg = configData[0];
  config = {
    fecha_inicio: cfg.fecha_inicio ? new Date(cfg.fecha_inicio) : null,
    fecha_fin: cfg.fecha_fin ? new Date(cfg.fecha_fin) : null,
    precio_galon: cfg.precio_galon
  };
}

// DESPUÉS - Agregar periodo formateado
let config = {};
let periodo = null;

if (configData && configData.length > 0) {
  const cfg = configData[0];

  const fechaInicio = cfg.fecha_inicio ? new Date(cfg.fecha_inicio) : null;
  const fechaFin = cfg.fecha_fin ? new Date(cfg.fecha_fin) : null;

  config = {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    precio_galon: cfg.precio_galon || 4.2
  };

  // 🔹 Crear objeto periodo con formatos estandarizados
  if (fechaInicio && fechaFin) {
    periodo = {
      // Formato corto para UI (dd-MM-yy)
      inicio: Utilities.formatDate(fechaInicio, "America/Lima", "dd-MM-yy"),
      fin: Utilities.formatDate(fechaFin, "America/Lima", "dd-MM-yy"),

      // Formato largo para emails (dd/MM/yyyy)
      inicioLargo: Utilities.formatDate(fechaInicio, "America/Lima", "dd/MM/yyyy"),
      finLargo: Utilities.formatDate(fechaFin, "America/Lima", "dd/MM/yyyy"),

      // Objetos Date originales (para cálculos)
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,

      // Label para portadas
      label: `${Utilities.formatDate(fechaInicio, "America/Lima", "dd/MM/yy")} — ${Utilities.formatDate(fechaFin, "America/Lima", "dd/MM/yy")}`
    };
  }
}
```

**Modificar data.js líneas 392-402** - Agregar periodo al return:

```javascript
// ANTES
return {
  config,
  clientes,
  contactos,
  dtc,
  expalert,
  aceite,
  relaciones: {
    clientes_por_opcenter,
  },
};

// DESPUÉS
return {
  config,
  periodo,  // ✅ AGREGAR ESTO
  clientes,
  contactos,
  dtc,
  expalert,
  aceite,
  relaciones: {
    clientes_por_opcenter,
  },
};
```

---

### Fase 2: Eliminar hardcodeos de periodo

#### generar_pdf.js

**Línea 216** - Portada:
```javascript
// ANTES
periodo : { ini: '2025-10-01', fin: '2025-10-30' },

// DESPUÉS
periodo: {
  ini: modelo.periodo.fecha_inicio,
  fin: modelo.periodo.fecha_fin,
  label: modelo.periodo.label
},
```

**Líneas 232-233** - Ya están bien, solo cambiar de undefined a definido:
```javascript
// DESPUÉS de la Fase 1, esto funcionará correctamente
const dataConectividad = renderGraficosConectividad(cliente.equipos || [], modelo.periodo);
const dataUtilizacion = renderUtilizacion(cliente.equipos || [], cliente.metricas || {}, modelo.periodo);
```

**Líneas 246, 252-253, 265-266, 274-275, 292** - Eliminar todos los fallbacks:
```javascript
// ANTES (línea 246)
periodo: { ini: modelo.periodo?.inicio || modelo.periodo?.fecha_inicio, fin: modelo.periodo?.fin || modelo.periodo?.fecha_fin, label: null },

// DESPUÉS
periodo: {
  ini: modelo.periodo.fecha_inicio,
  fin: modelo.periodo.fecha_fin,
  label: modelo.periodo.label
},

// ANTES (líneas 252-253)
const periodoFluidos = {
  inicio: modelo.periodo?.inicio || modelo.periodo?.fecha_inicio || "2025-10-01",
  fin:    modelo.periodo?.fin    || modelo.periodo?.fecha_fin    || "2025-10-30"
};

// DESPUÉS
const periodoFluidos = {
  inicio: modelo.periodo.inicio,
  fin: modelo.periodo.fin
};

// ANTES (líneas 265-266)
const expertAlertsHTML = generarEventosAlerta(
  cliente.equipos || [],
  {
    inicio: modelo.periodo?.inicio || modelo.periodo?.fecha_inicio || "01-10-25",
    fin: modelo.periodo?.fin || modelo.periodo?.fecha_fin || "30-10-25"
  }
);

// DESPUÉS
const expertAlertsHTML = generarEventosAlerta(
  cliente.equipos || [],
  {
    inicio: modelo.periodo.inicio,
    fin: modelo.periodo.fin
  }
);

// Aplicar mismo patrón a líneas 274-275 y 292
```

#### prueba.js (14 ubicaciones)

**Patrón a aplicar en líneas 22-23, 264-265, 702-703, 1428-1429, 2460-2461, 2892-2893**:
```javascript
// ANTES
const periodo = {
  inicio: modelo.periodo?.fecha_inicio || "01-10-25",
  fin: modelo.periodo?.fecha_fin || "28-10-25"
};

// DESPUÉS
const periodo = {
  inicio: modelo.periodo.inicio,
  fin: modelo.periodo.fin
};
```

**Línea 3207-3214** - Ya casi está bien, solo simplificar:
```javascript
// ANTES
let periodo = { inicio: "01-10-25", fin: "28-10-25" };

if (modelo.config?.fecha_inicio && modelo.config?.fecha_fin) {
  periodo = {
    inicio: Utilities.formatDate(new Date(modelo.config.fecha_inicio), "America/Lima", "dd-MM-yy"),
    fin: Utilities.formatDate(new Date(modelo.config.fecha_fin), "America/Lima", "dd-MM-yy")
  };
}

// DESPUÉS
const periodo = {
  inicio: modelo.periodo.inicio,
  fin: modelo.periodo.fin
};
```

---

### Fase 3: Eliminar hardcodeos de precio_galon

#### main.js:3
```javascript
// ANTES
function main() {
  datos = extraerDatosHojas();  // ❌ También falta const aquí
  const precioPorGalon = 3.75;
  const pdfPorCliente = generarPDF(datos,precioPorGalon);
}

// DESPUÉS
function main() {
  const modelo = generarModeloConMetricas();
  // Ya no necesita precioPorGalon como parámetro, está en modelo.config
  const pdfPorCliente = generarPDF(modelo);
}
```

#### pdf-sections.js:293
```javascript
// ANTES (en generarUtilizacion)
const precioPorGalon = 4.2;

// DESPUÉS - Recibir como parámetro
function generarUtilizacion(equipos, metricas, periodo, precioPorGalon) {
  // ... usar precioPorGalon directamente
}

// Al llamarla desde generar_pdf.js:
const utilizacionHTML = generarUtilizacion(
  cliente.equipos,
  cliente.metricas,
  modelo.periodo,
  modelo.config.precio_galon  // ✅ Pasar desde config
);
```

#### graficos.js:690
```javascript
// ANTES (en renderUtilizacion)
const precioPorGalon = 4.2;

// DESPUÉS - Recibir como parámetro
function renderUtilizacion(equipos, metricas, periodo, precioPorGalon) {
  // ... usar precioPorGalon directamente
}

// Al llamarla:
const dataUtilizacion = renderUtilizacion(
  cliente.equipos,
  cliente.metricas,
  modelo.periodo,
  modelo.config.precio_galon  // ✅ Pasar desde config
);
```

---

## 📋 CHECKLIST DE CAMBIOS

### ✅ Fase 1: Centralizar (data.js)
- [ ] Crear objeto `periodo` en buildDataModel() con todos los formatos
- [ ] Agregar `periodo` al return de buildDataModel()
- [ ] Verificar que `generarModeloConMetricas()` retorna periodo

### ✅ Fase 2: Eliminar hardcodeos de periodo
- [ ] generar_pdf.js línea 216 (portada)
- [ ] generar_pdf.js líneas 246, 252-253, 265-266, 274-275, 292 (6 lugares)
- [ ] prueba.js líneas 22-23, 264-265, 702-703, 1428-1429, 2460-2461, 2892-2893, 3207 (7 lugares)

### ✅ Fase 3: Eliminar hardcodeos de precio_galon
- [ ] main.js línea 3 (usar modelo.config.precio_galon)
- [ ] pdf-sections.js línea 293 (recibir como parámetro)
- [ ] graficos.js línea 690 (recibir como parámetro)
- [ ] Actualizar llamadas a estas funciones

### ✅ Verificación
- [ ] Ejecutar generarModeloConMetricas() y verificar modelo.periodo existe
- [ ] Verificar modelo.periodo.inicio, .fin, .label
- [ ] Verificar modelo.config.precio_galon
- [ ] Generar PDF de prueba y revisar fechas consistentes
- [ ] Verificar cálculos económicos con precio correcto

---

## 📊 IMPACTO DE LA SOLUCIÓN

### Antes
- 18 hardcodeos de periodo
- 3 hardcodeos de precio_galon (valores diferentes)
- 3 formatos de fecha diferentes
- Valores inconsistentes entre reportes
- 12% error en cálculos económicos

### Después
- ✅ **1 única fuente de verdad** (hoja CONFIG)
- ✅ **0 hardcodeos**
- ✅ **1 formato estandarizado** por tipo de uso
- ✅ **Periodo consistente** en todo el reporte
- ✅ **Precio correcto** en todos los cálculos
- ✅ **Fácil mantenimiento** (cambio en 1 lugar = todo actualizado)

### Beneficios
1. **Precisión**: Cálculos económicos correctos
2. **Consistencia**: Mismo periodo en todo el reporte
3. **Mantenibilidad**: Cambio en CONFIG = cambio global
4. **Confiabilidad**: Usuario ve información coherente
5. **Escalabilidad**: Fácil agregar nuevos campos a CONFIG

---

## 🎯 TIEMPO ESTIMADO

| Fase | Tiempo | Complejidad |
|------|--------|-------------|
| Fase 1: Centralizar | 20 min | Media |
| Fase 2: Periodo (18 lugares) | 30 min | Baja |
| Fase 3: Precio (3 lugares) | 15 min | Baja |
| Verificación | 15 min | Media |
| **TOTAL** | **80 min** | **Media** |

---

## ⚠️ RIESGOS Y MITIGACIÓN

### Riesgo 1: CONFIG vacío o mal formateado
**Mitigación**: Agregar validaciones y valores por defecto
```javascript
config = {
  fecha_inicio: fechaInicio || new Date('2025-10-01'),
  fecha_fin: fechaFin || new Date('2025-10-31'),
  precio_galon: cfg.precio_galon || 4.2
};
```

### Riesgo 2: Funciones que esperan formato específico
**Mitigación**: Proveer múltiples formatos en modelo.periodo
```javascript
periodo = {
  inicio: "01-10-25",        // Para secciones
  inicioLargo: "01/10/2025", // Para emails
  fecha_inicio: Date,        // Para cálculos
  label: "01/10 — 31/10"    // Para portadas
};
```

### Riesgo 3: Breaking changes en prueba.js
**Mitigación**: Mantener compatibilidad temporal con fallbacks
```javascript
const periodo = modelo.periodo || {
  inicio: modelo.config?.fecha_inicio,
  fin: modelo.config?.fecha_fin
};
```

---

**Generado**: 7 de Noviembre, 2024
**Prioridad**: 🔴 ALTA - Afecta precisión de datos y mantenibilidad
**Próximo paso**: Fase 1 - Centralizar en buildDataModel()
