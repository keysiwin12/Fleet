# 🧪 Instrucciones para Probar los Estilos CSS Corregidos

## ✅ Cambios Realizados

Se corrigieron los nombres de clases CSS en `graficos.js` para que coincidan con `reporte-flota.html`:
- `severity-label` → `alert-bar-label`
- `severity-bar` → `alert-bar-bg`
- `severity-fill` → `alert-bar-fill`

## 📋 Cómo Ejecutar la Prueba

### Opción 1: Función de Prueba Individual (Recomendado)

1. **Abre tu Google Apps Script**
   - Ve a tu proyecto en Google Apps Script
   - Asegúrate de que todos los archivos estén sincronizados con `clasp push`

2. **Ejecuta la función de prueba**
   ```javascript
   probarPDF4PaginasConHtmlService("7499")
   ```

   **Pasos en el editor:**
   - Selecciona la función `probarPDF4PaginasConHtmlService` en el dropdown
   - Haz clic en ▶️ Ejecutar
   - Espera a que termine (puede tomar 10-30 segundos)

3. **Verifica el resultado**
   - Aparecerá un popup con el enlace al PDF generado
   - Abre el PDF en Drive
   - **Revisa específicamente la página 2 (RESUMEN)**

### Opción 2: Generar PDFs para Todos los Clientes

Si quieres probar con todos los clientes:

```javascript
probarPDF4PaginasTodos({ max: 1 })
```

Esto generará PDF solo para 1 cliente (el primero).

## 🔍 Qué Verificar en el PDF

### En la Página 2 - RESUMEN

Busca la sección **"Alertas Técnicas"** que contiene 3 tarjetas:

#### 1. 📊 CÓDIGOS DTC
```
Debe mostrar:
✅ Número total de códigos en grande
✅ 3 barras horizontales con gradientes:
   - Alta (roja)
   - Media (naranja)
   - Info (azul)
✅ Porcentajes a la derecha de cada barra
```

#### 2. ⚠️ EXPERT ALERTS
```
Debe mostrar:
✅ Número total de alertas en grande
✅ 3 barras horizontales con gradientes:
   - Crítica (rojo oscuro)
   - Alta (naranja)
   - Rendimiento (amarillo)
✅ Porcentajes a la derecha de cada barra
```

#### 3. 💧 ANÁLISIS DE ACEITE
```
Debe mostrar:
✅ Número total de análisis en grande
✅ 3 barras horizontales con gradientes:
   - Normal (azul/verde)
   - Precaución (naranja)
   - Anormal (rojo)
✅ Porcentajes a la derecha de cada barra
```

## ✅ Resultado Esperado

**ANTES** (con el bug):
- Las barras NO se veían o aparecían sin estilos
- Solo texto plano sin formato
- Sin colores de gradiente

**AHORA** (corregido):
- ✅ Barras con gradientes de colores según severidad
- ✅ Números alineados correctamente
- ✅ Porcentajes visibles dentro de las barras
- ✅ Layout limpio y profesional

## 🐛 Si Algo Sale Mal

### Error: "Cliente no encontrado"
```javascript
// Cambia el ID del cliente por uno que exista en tu base de datos
probarPDF4PaginasConHtmlService("OTRO_ID")
```

### Error: "clasp not found" o archivos desactualizados
```bash
# En la terminal, desde la carpeta del proyecto:
clasp push
```

### Las barras siguen sin verse
1. Verifica que `clasp push` haya sincronizado `graficos.js`
2. Comprueba que no haya errores en la consola de Apps Script
3. Intenta hacer "hard refresh" del script (cerrar y abrir el editor)

## 📞 Siguiente Paso

Una vez verificado que los estilos funcionan:
1. ✅ Marca esta prueba como exitosa
2. 🚀 Procede a generar PDFs para todos los clientes con:
   ```javascript
   probarPDF4PaginasTodos()
   ```
3. 📧 O usa la función de envío automático si está habilitada

---

**Última actualización:** Commit `b9cfed8` - Fix CSS class names
