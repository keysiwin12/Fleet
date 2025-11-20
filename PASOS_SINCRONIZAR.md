# 🔄 Cómo Sincronizar los Cambios a tu VS Code

## 📍 Situación Actual
- ✅ Los cambios están en GitHub en la rama: `claude/code-review-011CUrniKhB8b8s54RXKqHMy`
- ⏳ Necesitas traerlos a tu Visual Studio Code local
- ⏳ Después subirlos a Google Apps Script con `clasp push`

---

## 🚀 Pasos para Sincronizar

### 1️⃣ Abre tu Terminal en VS Code

**Windows:** `Ctrl + Ñ` o `Ctrl + `` ` ``
**Mac:** `Cmd + Ñ` o `Cmd + `` ` ``

O ve a: **Ver → Terminal**

---

### 2️⃣ Ve a la Carpeta del Proyecto

```bash
cd ruta/a/tu/proyecto/Fleet
```

**Verifica que estés en la carpeta correcta:**
```bash
pwd
# Debe mostrar algo como: /Users/tu-usuario/proyectos/Fleet
```

---

### 3️⃣ Trae los Cambios desde GitHub

```bash
# Traer todos los cambios del repositorio remoto
git fetch origin

# Cambiar a la rama con los cambios
git checkout claude/code-review-011CUrniKhB8b8s54RXKqHMy

# Asegurarte de tener la última versión
git pull origin claude/code-review-011CUrniKhB8b8s54RXKqHMy
```

---

### 4️⃣ Verifica los Cambios

Deberías ver los archivos modificados en VS Code:

**Archivos modificados:**
- ✅ `graficos.js` (líneas 185-405)
- ✅ `INSTRUCCIONES_PRUEBA.md` (nuevo)
- ✅ `ejemplo_prueba.gs` (nuevo)

**En VS Code, abre `graficos.js` y busca la línea 200:**
```javascript
// ✅ CORRECTO (nuevo):
<div class="alert-bar-label"><span>Alta</span><span>${alta}</span></div>

// ❌ ANTERIOR (si ves esto, los cambios NO se trajeron):
<span class="severity-label">Alta ${alta}</span>
```

---

### 5️⃣ Sube los Cambios a Google Apps Script

```bash
clasp push
```

**Deberías ver:**
```
└─ graficos.js
└─ data.js
└─ generar_pdf.js
... (todos tus archivos)
Pushed X files.
```

---

### 6️⃣ Verifica en Google Apps Script

1. Abre: https://script.google.com
2. Abre tu proyecto
3. Abre el archivo `graficos.js`
4. Ve a la línea ~200
5. **Debe decir:** `alert-bar-label` (NO `severity-label`)

---

## 🔍 Verificación Rápida

Ejecuta estos comandos para verificar que todo esté bien:

```bash
# ¿En qué rama estoy?
git branch
# Debe mostrar: * claude/code-review-011CUrniKhB8b8s54RXKqHMy

# ¿Qué archivos cambiaron?
git log --oneline -3
# Debe mostrar:
# c0e40e8 Docs: Agregar instrucciones de prueba...
# b9cfed8 Fix: Corregir nombres de clases CSS...
# 268fad8 primer commit

# ¿Los cambios están en mi carpeta local?
grep -n "alert-bar-label" graficos.js
# Debe mostrar varias líneas con "alert-bar-label"
```

---

## ❌ Solución de Problemas

### Error: "branch does not exist"
```bash
# Actualiza la lista de ramas
git fetch origin

# Lista todas las ramas (locales y remotas)
git branch -a

# Si ves: remotes/origin/claude/code-review-011CUrniKhB8b8s54RXKqHMy
git checkout -b claude/code-review-011CUrniKhB8b8s54RXKqHMy origin/claude/code-review-011CUrniKhB8b8s54RXKqHMy
```

### Error: "clasp: command not found"
```bash
# Instalar clasp globalmente
npm install -g @google/clasp

# Verificar instalación
clasp --version
```

### Los archivos no se ven modificados en VS Code
```bash
# Forzar actualización
git reset --hard origin/claude/code-review-011CUrniKhB8b8s54RXKqHMy
```

---

## ✅ Checklist Final

- [ ] Ejecuté `git fetch origin`
- [ ] Ejecuté `git checkout claude/code-review-011CUrniKhB8b8s54RXKqHMy`
- [ ] Veo los archivos modificados en VS Code
- [ ] El archivo `graficos.js` tiene `alert-bar-label` (no `severity-label`)
- [ ] Ejecuté `clasp push` sin errores
- [ ] Verifiqué los cambios en script.google.com

---

## 🎯 Próximo Paso

Una vez sincronizado todo:
1. Ve a https://script.google.com
2. Ejecuta la función `probarPDF4PaginasConHtmlService("7499")`
3. Verifica que las barras de alertas se vean con estilos correctos

---

**¿Dudas?** Avísame en qué paso te atoras.
