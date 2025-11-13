# Despliegue de Rutinia con Railway (Backend) y Vercel (Frontend)

## Estado Actual del Despliegue

✅ **Backend**: Desplegado en Railway en `https://rutinia1-production.up.railway.app/`  
⏳ **Frontend**: Por desplegar en Vercel  
✅ **Base de Datos**: MongoDB Atlas en `tracker_habitos_db`

---

## 📋 Configuración Realizada

### 1. Frontend (Vercel)

#### Archivo: `.env.production`
```env
VITE_API_URL=https://rutinia1-production.up.railway.app/api
```

Este archivo configura la URL del API que usará el frontend en producción. Vercel lo leerá automáticamente durante la compilación.

#### Archivo: `vercel.json`
```json
{
  "buildCommand": "cd src/frontend-react && npm install && npm run build",
  "outputDirectory": "src/frontend-react/dist",
  "framework": "vite",
  "env": {
    "VITE_API_URL": "https://rutinia1-production.up.railway.app/api"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Detalles de configuración:**
- `buildCommand`: Instruye a Vercel cómo construir el proyecto (navega a `src/frontend-react`, instala dependencias y ejecuta build)
- `outputDirectory`: Le indica a Vercel dónde están los archivos compilados (`dist`)
- `framework`: Especifica que usamos Vite
- `env`: Variables de entorno que Vercel debe usar durante la compilación
- `rewrites`: Redirige todas las rutas a `index.html` para que React Router funcione correctamente

### 2. Backend (Ya en Railway)

**URL:** `https://rutinia1-production.up.railway.app/`  
**Endpoints API:** `https://rutinia1-production.up.railway.app/api/`

Variables configuradas en Railway:
```
ALLOWED_HOSTS=rutinia1-production.up.railway.app,*.railway.app
CORS_ALLOWED_ORIGINS=https://rutinia1-293rrnq5p-juan-fernando-ballesteros-macias-projects.vercel.app
DATABASE_URL=mongodb+srv://admin:S37nmaxVe6z0uDXX@cluster0.4c7fi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DEBUG=False
MONGO_DB=tracker_habitos_db
SECRET_KEY=7+b^me-4k+gcs&2^$51fhe22xsuzqkfq%_l_nzuy*d1(ms8txx
```

---

## 🚀 Instrucciones de Despliegue en Vercel

### Opción A: A través de la Interfaz Web

1. **Ir a Vercel Dashboard**
   - Accede a https://vercel.com/dashboard

2. **Importar Proyecto**
   - Haz clic en "New Project"
   - Selecciona tu repositorio de GitHub (`JuanFernandoBallesterosMaciasUIS/rutinia1`)
   - Selecciona la rama `despliegueVercel`

3. **Configurar Build**
   - Framework: **Vite**
   - Build Command: `cd src/frontend-react && npm install && npm run build`
   - Output Directory: `src/frontend-react/dist`

4. **Agregar Variables de Entorno**
   - Haz clic en "Environment Variables"
   - Agrega:
     ```
     VITE_API_URL = https://rutinia1-production.up.railway.app/api
     ```

5. **Deploy**
   - Haz clic en "Deploy"
   - Vercel comenzará a construir y desplegar el proyecto

### Opción B: Usando Vercel CLI

```powershell
# 1. Instalar Vercel CLI (si no lo tienes)
npm install -g vercel

# 2. Ir al directorio raíz del proyecto
cd "C:\Users\jball\OneDrive\Documentos\UIS\septimo semestre\Entornos de programación\nuevo rutinia\rutinia1"

# 3. Login en Vercel
vercel login

# 4. Link el proyecto (si es la primera vez)
vercel link

# 5. Agregar variable de entorno
vercel env add VITE_API_URL
# Pega: https://rutinia1-production.up.railway.app/api

# 6. Desplegar en producción
vercel --prod
```

---

## ✅ Verificación Post-Despliegue

### 1. Verificar que el Frontend carga
```
https://tu-proyecto.vercel.app
```
Deberías ver la página de login de Rutinia.

### 2. Verificar conexión con el Backend
En la consola del navegador (F12), deberías ver:
```
POST https://rutinia1-production.up.railway.app/api/... 200 OK
```

### 3. Probar autenticación
1. Intenta registrar un nuevo usuario
2. Intenta hacer login
3. Crea un hábito nuevo

Si todo funciona sin errores **401 Unauthorized** o **CORS**, entonces el despliegue es exitoso.

### 4. Revisar logs de Vercel
En el dashboard de Vercel, ve a "Deployments" y revisa los logs si hay errores.

---

## 🔍 Solución de Problemas

### Error: CORS Policy
**Síntoma:** `Access to XMLHttpRequest at 'https://rutinia1-production.up.railway.app/api/...' from origin 'https://tu-proyecto.vercel.app' has been blocked by CORS policy`

**Solución:** 
1. Ve a Railway dashboard
2. Verifica que `CORS_ALLOWED_ORIGINS` incluya tu dominio de Vercel
3. Asegúrate de que tenga `https://` (no `http://`)

### Error: 404 Not Found
**Síntoma:** Las rutas de React dan 404

**Solución:** 
- Verifica que `vercel.json` tenga las `rewrites` correctas
- Debería redirigir todas las rutas a `/index.html`

### Error: Variables de entorno no se cargan
**Síntoma:** El frontend no puede conectar al backend

**Solución:**
1. Verifica que `VITE_API_URL` está en las variables de entorno de Vercel
2. Reconstruye el proyecto (haz un nuevo push o redeploy)
3. Las variables con prefijo `VITE_` deben estar disponibles en el build time

---

## 📁 Estructura de Archivos Importante

```
rutinia1/
├── vercel.json                          # Configuración de Vercel
├── .env.example                         # Ejemplo de variables (git tracked)
├── .env                                 # Variables locales (NO commiteado)
└── src/
    └── frontend-react/
        ├── .env.production              # Variables para producción
        ├── vite.config.js
        ├── package.json
        └── src/
            └── services/
                └── api.js               # Usa VITE_API_URL
```

---

## 📝 Notas Importantes

1. **No commitear credenciales**
   - `.env` debe estar en `.gitignore`
   - Solo `.env.example` debe estar versionado

2. **Variables de entorno en Vercel**
   - Se configuran en el dashboard de Vercel
   - Se aplican durante el build y deployment
   - Las variables con prefijo `VITE_` están disponibles en el cliente

3. **MongoDB Atlas**
   - Asegúrate de que la IP de Railway esté agregada a IP Access List
   - O usa `0.0.0.0/0` para permitir cualquier IP (menos seguro pero funciona)

4. **CORS Configuration**
   - El backend (Railway) debe permitir el origen del frontend (Vercel)
   - El frontend debe usar la URL correcta del backend

---

## 🔗 URLs de Referencia

- **Frontend Vercel:** `https://rutinia1-293rrnq5p-juan-fernando-ballesteros-macias-projects.vercel.app`
- **Backend Railway:** `https://rutinia1-production.up.railway.app/`
- **API Endpoint:** `https://rutinia1-production.up.railway.app/api/`
- **MongoDB Atlas:** `https://cloud.mongodb.com/`

---

## ✨ Próximos Pasos

1. ✅ Revisar que todos los archivos de configuración estén en su lugar
2. ⏳ Hacer push de los cambios a la rama `despliegueVercel`
3. ⏳ Desplegar en Vercel (ver instrucciones arriba)
4. ⏳ Verificar que todo funciona
5. ⏳ Hacer merge de `despliegueVercel` a `main` cuando esté todo bien

---

**Estado:** ✅ Configuración completada - Listo para desplegar en Vercel

**Última actualización:** 13 de noviembre de 2025
