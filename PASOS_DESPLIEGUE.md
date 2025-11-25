# 🚀 PASOS RÁPIDOS PARA COMPLETAR EL DESPLIEGUE

## ✅ Lo que ya está hecho:

1. ✅ Frontend desplegado en Vercel
2. ✅ Código actualizado para usar variables de entorno
3. ✅ Archivos de configuración creados

## 📝 Lo que necesitas hacer AHORA:

### Paso 1: Hacer commit y push de los cambios

```powershell
git add .
git commit -m "Configurar variables de entorno y preparar para Railway"
git push origin despliegueVercel
```

### Paso 2: Desplegar Backend en Railway

1. **Ir a Railway:**
   - https://railway.app/
   - Registrarse con GitHub

2. **Crear nuevo proyecto:**
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Seleccionar `Rutinia-1.0`
   - Rama: `despliegueVercel`

3. **Configurar Railway:**
   - Root Directory: `src/backend-django`
   - Start Command: `cd rutinia && gunicorn rutinia.wsgi:application --bind 0.0.0.0:$PORT`

4. **Agregar Variables de Entorno:**
   ```
   SECRET_KEY=<genera-con-comando-abajo>
   DEBUG=False
   ALLOWED_HOSTS=.railway.app,.vercel.app
   DATABASE_URL=<tu-mongodb-atlas-url>
   MONGO_DB=rutinia
   CORS_ALLOWED_ORIGINS=https://rutinia1-cbg7gd979-juan-fernando-ballesteros-macias-projects.vercel.app
   PORT=8000
   ```

   **Generar SECRET_KEY:**
   ```powershell
   cd src\backend-django\rutinia
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

5. **Generar dominio:**
   - Settings → Networking → "Generate Domain"
   - **Copia la URL** (ej: `https://rutinia-backend-production.up.railway.app`)

### Paso 3: Configurar MongoDB Atlas (si no lo has hecho)

1. https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Database Access → Add user
4. Network Access → Add IP → `0.0.0.0/0`
5. Copiar connection string

### Paso 4: Configurar el Frontend en Vercel

1. **Ir a tu proyecto en Vercel:**
   - https://vercel.com/dashboard

2. **Agregar variable de entorno:**
   - Settings → Environment Variables
   - Nombre: `VITE_API_URL`
   - Valor: `https://tu-proyecto.up.railway.app/api` (la URL de Railway)
   - Apply to: Production, Preview, Development

3. **Redeployear:**
   - Deployments → Latest → "Redeploy"

## 🎯 Verificación Final

### Backend:
```bash
curl https://tu-proyecto.up.railway.app/api/
```

### Frontend:
1. Abrir https://rutinia1-cbg7gd979-juan-fernando-ballesteros-macias-projects.vercel.app
2. Intentar hacer login/registro
3. ✅ Debería funcionar sin errores de CORS

## 📚 Documentación Completa

- Backend Railway: `DEPLOY_RAILWAY.md`
- Frontend Vercel: `DEPLOY_VERCEL.md`

## ⏱️ Tiempo estimado: 15-20 minutos

---

**¿Problemas?** Revisa los logs en:
- Railway: Dashboard → View Logs
- Vercel: Deployments → Latest → View Function Logs
