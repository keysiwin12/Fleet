# 🚀 Guía de Uso - Sistema de Procesamiento por Lotes

## 📋 Descripción

Este sistema divide la generación de 222 PDFs de reportes de flota en **3 lotes de 75 clientes cada uno**, evitando el límite de 30 minutos de Google Apps Script.

### ⏱️ Tiempos Estimados

- **Por cliente**: ~18.6 segundos
- **Por lote (75 clientes)**: ~23.6 minutos
- **Tiempo total**: ~75 minutos (incluyendo pausas de 3 minutos entre lotes)

---

## ⚠️ IMPORTANTE: Autorización Requerida (PASO OBLIGATORIO)

**Antes de ejecutar el sistema por primera vez**, necesitas autorizar los permisos para gestionar triggers.

### 🔑 Pasos de Autorización:

1. **Subir el código a Google Apps Script**
   - Asegúrate de que `appsscript.json` incluye el scope:
     ```json
     "https://www.googleapis.com/auth/script.scriptapp"
     ```
   - ✅ Este scope ya está incluido en el archivo `appsscript.json`

2. **Ejecutar cualquier función para forzar la autorización**
   - Abre el editor de Google Apps Script
   - Selecciona la función `eliminarTriggersAntiguos` en el menú desplegable
   - Haz clic en "Ejecutar" (▶️)

3. **Autorizar permisos**
   - Aparecerá un diálogo: "Autorización necesaria"
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Verás la advertencia "Esta app no está verificada por Google" (es normal)
   - Haz clic en "Opciones avanzadas"
   - Haz clic en "Ir a [nombre del proyecto] (no seguro)"
   - Revisa los permisos solicitados:
     - ✅ Administrar hojas de cálculo
     - ✅ Enviar correos
     - ✅ **Administrar triggers y funciones programadas**
   - Haz clic en "Permitir"

4. **Verificar autorización**
   - La función `eliminarTriggersAntiguos()` debería ejecutarse sin errores
   - Si ves "ℹ️ No se encontraron triggers antiguos" = ✅ Autorización exitosa

**¿Por qué este paso?**
El sistema necesita permisos para:
- Crear triggers programados (`ScriptApp.newTrigger()`)
- Listar triggers existentes (`ScriptApp.getProjectTriggers()`)
- Eliminar triggers (`ScriptApp.deleteTrigger()`)

**Solo necesitas hacer esto UNA VEZ.** Después, todas las funciones funcionarán normalmente.

---

## 🎯 Funciones Principales

### 1️⃣ `iniciarProcesamientoLotes()`

**Inicia el proceso completo de generación de PDFs por lotes.**

```javascript
iniciarProcesamientoLotes()
```

**¿Qué hace?**
- Limpia triggers antiguos automáticamente
- Crea la hoja `BATCH_CONTROL` para monitoreo
- Divide los clientes en 3 lotes
- Programa el primer lote para ejecutarse en 5 segundos
- Los lotes 2 y 3 se programan automáticamente con 3 minutos de pausa entre ellos

**Resultado:**
```javascript
{
  status: 'INICIADO',
  totalClientes: 222,
  numLotes: 3,
  primerLoteEn: '5 segundos'
}
```

---

### 2️⃣ `verProgresoLotes()`

**Muestra el estado actual del procesamiento.**

```javascript
verProgresoLotes()
```

**Resultado:**
```javascript
{
  estado: 'EN PROCESO',
  fechaInicio: Mon Jan 13 2025 10:30:00,
  fechaFin: 'En proceso',
  totalClientes: 222,
  totalLotes: 3,
  lotesCompletados: 1,
  lotePendientes: 2,
  progreso: '33%',
  pdfsGenerados: 75,
  correosEnviados: 75
}
```

**Consola:**
```
📊 PROGRESO DEL PROCESAMIENTO POR LOTES
══════════════════════════════════════════════════
Estado: EN PROCESO
Progreso: 33% (1/3 lotes)
PDFs generados: 75/222
Correos enviados: 75
Inicio: Mon Jan 13 2025 10:30:00
══════════════════════════════════════════════════
```

---

### 3️⃣ `detenerProcesamientoLotes()`

**Detiene el procesamiento y cancela todos los triggers pendientes.**

```javascript
detenerProcesamientoLotes()
```

**¿Qué hace?**
- Elimina todos los triggers de `ejecutarPrimerLote` y `ejecutarSiguienteLote`
- Marca el estado como "DETENIDO MANUALMENTE"
- Limpia las properties del script
- **IMPORTANTE:** Los lotes ya completados NO se revierten

**Resultado:**
```javascript
{
  status: 'DETENIDO',
  triggersEliminados: 2
}
```

---

### 4️⃣ `eliminarTriggersAntiguos()`

**Limpia triggers antiguos del sistema.**

```javascript
eliminarTriggersAntiguos()
```

**¿Cuándo usar?**
- Se ejecuta **automáticamente** al iniciar un nuevo procesamiento
- Puedes ejecutarla manualmente si necesitas limpiar triggers huérfanos

**Resultado:**
```
🧹 Limpiando triggers antiguos...
   ✅ Trigger antiguo eliminado: ejecutarPrimerLote
   ✅ Trigger antiguo eliminado: ejecutarSiguienteLote
✅ 2 trigger(s) antiguo(s) eliminado(s).
```

---

### 5️⃣ `probarSistemaPorLotes()`

**Función de prueba con solo 2 clientes por lote.**

```javascript
probarSistemaPorLotes()
```

**Uso recomendado:** Ejecutar ANTES del procesamiento real para verificar que todo funciona correctamente.

---

## 📊 Hoja BATCH_CONTROL

Al iniciar el procesamiento, se crea automáticamente la hoja `BATCH_CONTROL` con:

### Información General

| Campo | Descripción |
|-------|-------------|
| Fecha Inicio | Cuándo se inició el procesamiento |
| Total Clientes | 222 |
| Total Lotes | 3 |
| Lotes Completados | Actualizados en tiempo real |
| PDFs Generados | Contador de PDFs exitosos |
| Correos Enviados | Contador de emails enviados |
| Estado | EN PROCESO / COMPLETADO / ERROR / DETENIDO |
| Fecha Fin | Cuándo terminó el proceso |

### Tabla de Lotes

| Lote | Rango Clientes | Cantidad | Estado | Inicio | Fin | Duración | Errores |
|------|----------------|----------|--------|--------|-----|----------|---------|
| Lote 1 | 1-75 | 75 | COMPLETADO | 10:30:05 | 10:53:41 | 23.6 min | Sin errores |
| Lote 2 | 76-150 | 75 | PROCESANDO | 10:56:41 | | | |
| Lote 3 | 151-222 | 72 | PENDIENTE | | | | |

---

## 🔄 Flujo del Proceso

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario ejecuta iniciarProcesamientoLotes() │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 2. Sistema elimina triggers antiguos           │
│    y crea hoja BATCH_CONTROL                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 3. Programa Lote 1 (5 segundos)                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 4. LOTE 1: Procesa clientes 1-75               │
│    (~23.6 minutos)                              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 5. Lote 1 completo → Programa Lote 2 (+3 min)  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 6. LOTE 2: Procesa clientes 76-150             │
│    (~23.6 minutos)                              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 7. Lote 2 completo → Programa Lote 3 (+3 min)  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 8. LOTE 3: Procesa clientes 151-222            │
│    (~22.3 minutos, solo 72 clientes)           │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│ 9. Estado = COMPLETADO                          │
│    222 PDFs generados y enviados ✅             │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Paso a Paso - Uso Normal

### 1. Ejecutar el Proceso

```javascript
// En Google Apps Script
iniciarProcesamientoLotes()
```

**Salida esperada:**
```
🚀 Iniciando procesamiento por lotes...
📊 Total clientes: 222
📦 Lotes a procesar: 3
👥 Clientes por lote: 75
✅ Sistema iniciado. Primer lote se ejecutará en 5 segundos.
```

### 2. Monitorear el Progreso

**Opción A: Ver en la consola**
```javascript
verProgresoLotes()
```

**Opción B: Abrir la hoja `BATCH_CONTROL`**
- Se actualiza en tiempo real con el progreso de cada lote

### 3. Esperar a que Termine

El proceso completo toma aproximadamente **75 minutos**:
- Lote 1: 23.6 min
- Pausa: 3 min
- Lote 2: 23.6 min
- Pausa: 3 min
- Lote 3: 22.3 min

### 4. Verificar Resultados

```javascript
verProgresoLotes()
```

**Resultado esperado:**
```javascript
{
  estado: 'COMPLETADO',
  pdfsGenerados: 222,
  correosEnviados: 222
}
```

---

## ⚠️ Manejo de Errores

### Si un cliente falla:
- El lote **continúa** con los siguientes clientes
- El error se registra en la columna "Errores" de `BATCH_CONTROL`
- Los otros clientes del lote NO se ven afectados

### Si necesitas detener el proceso:
```javascript
detenerProcesamientoLotes()
```

- Los lotes ya completados **NO se revierten**
- Los triggers pendientes se cancelan
- Puedes reiniciar desde cero con `iniciarProcesamientoLotes()`

---

## 🧪 Prueba Antes de Ejecutar

**Altamente recomendado:** Ejecutar una prueba con pocos clientes:

```javascript
probarSistemaPorLotes()
```

Esto procesará solo **2 clientes por lote** para verificar que:
- Los triggers se crean correctamente
- Los PDFs se generan
- Los correos se envían
- La hoja BATCH_CONTROL se actualiza

---

## ⚙️ Configuración Avanzada

Si necesitas ajustar parámetros, edita `batch-processing.js`:

```javascript
const CONFIG_LOTES = {
  CLIENTES_POR_LOTE: 75,           // Cambiar a 50 si quieres lotes más pequeños
  PAUSA_ENTRE_LOTES_MIN: 3,        // Cambiar a 5 para más pausa
  NOMBRE_HOJA_CONTROL: 'BATCH_CONTROL',
  TAG_TRIGGER: 'batch_processing_fleet'
};
```

---

## 📝 Notas Importantes

1. **No cerrar Google Sheets** mientras el proceso está corriendo (aunque puedes minimizar)
2. **Los triggers se ejecutan automáticamente** - no necesitas hacer nada después de `iniciarProcesamientoLotes()`
3. **Puedes revisar el progreso en cualquier momento** con `verProgresoLotes()` o la hoja `BATCH_CONTROL`
4. **Si algo falla**, usa `detenerProcesamientoLotes()` y revisa los logs en `View > Logs`

---

## 🎯 Checklist de Ejecución

Antes de ejecutar en producción:

- [ ] Ejecutar `probarSistemaPorLotes()` con datos de prueba
- [ ] Verificar que `extraerDatosHojas()` retorna 222 clientes
- [ ] Verificar que `generarPDF()` funciona correctamente
- [ ] Verificar que `enviarPDFsPorCorreo()` está activado (no comentado)
- [ ] Verificar que los destinatarios de correo son correctos (no ksimbron@ipesa.com.pe)
- [ ] Limpiar triggers antiguos con `eliminarTriggersAntiguos()`
- [ ] Ejecutar `iniciarProcesamientoLotes()`
- [ ] Monitorear el primer lote para confirmar que funciona
- [ ] Esperar a que termine (aprox. 75 minutos)
- [ ] Verificar resultados con `verProgresoLotes()`

---

## 🆘 Solución de Problemas

### "No se crea la hoja BATCH_CONTROL"
**Solución:** Verificar permisos de escritura en la hoja de cálculo

### "Los triggers no se ejecutan"
**Solución:**
1. Verificar en `Edit > Current project's triggers` que existen
2. Ejecutar `eliminarTriggersAntiguos()` y volver a iniciar

### "Proceso muy lento"
**Solución:** Normal, son 222 clientes. Revisar tiempos por cliente en los logs.

### "Quiero detener el proceso"
**Solución:** `detenerProcesamientoLotes()`

---

**¿Preguntas?** Revisar logs en `View > Executions` para detalles de cada ejecución.
