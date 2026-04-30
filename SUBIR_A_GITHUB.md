# 📤 GUÍA PARA SUBIR ARCHIVOS A GITHUB

## OPCIÓN 1: GitHub Desktop (Recomendado)

1. **Abre GitHub Desktop**
2. **Selecciona el repositorio** `medicare-ai`
3. **Verás los cambios** en la columna izquierda
4. **Escribe un mensaje** de commit: "Actualizar configuración para Vercel"
5. **Haz clic en** "Commit to main"
6. **Haz clic en** "Push origin" (arriba)

## OPCIÓN 2: GitHub Web

1. **Ve a** https://github.com/FelipilloRD/medicare-ai
2. **Para cada archivo modificado**:
   - Navega a la carpeta del archivo
   - Haz clic en el archivo
   - Haz clic en el ícono del lápiz (Edit)
   - Copia y pega el contenido nuevo
   - Haz clic en "Commit changes"

### Archivos importantes a actualizar:

- ✅ `vercel.json` - Configuración de Vercel
- ✅ `.env.example` - Plantilla de variables
- ✅ `.gitignore` - Archivos a ignorar
- ✅ `VERCEL_SETUP.md` - Guía de despliegue
- ✅ `backend/database-postgres.js` - Conexión a Supabase
- ✅ `backend/server.js` - Servidor actualizado

## OPCIÓN 3: Línea de comandos (Git)

Si tienes Git instalado:

```bash
cd clinica-ai
git add .
git commit -m "Actualizar configuración para Vercel con Supabase"
git push origin main
```

## ✅ VERIFICAR

Después de subir los archivos:

1. Ve a https://github.com/FelipilloRD/medicare-ai
2. Verifica que veas los archivos actualizados
3. Busca el archivo `VERCEL_SETUP.md` para confirmar

## 🚀 SIGUIENTE PASO

Una vez que los archivos estén en GitHub:
1. Ve a https://vercel.com
2. Importa el proyecto desde GitHub
3. Sigue la guía en `VERCEL_SETUP.md`
