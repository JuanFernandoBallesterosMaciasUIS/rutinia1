# Guía de Despliegue del Backend en Railway

## 🚂 Railway - Backend Django

Railway es una plataforma moderna que facilita el despliegue de aplicaciones Django.

### 📋 Pasos para Desplegar

#### 1. Crear cuenta en Railway

1. Ve a [Railway.app](https://railway.app/)
2. Regístrate con tu cuenta de GitHub

#### 2. Crear nuevo proyecto

1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Autoriza a Railway a acceder a tus repositorios
4. Selecciona el repositorio `Rutinia-1.0`
5. Selecciona la rama `despliegueVercel`

#### 3. Configurar el servicio

Railway detectará automáticamente que es un proyecto Python/Django.

**Configuración importante:**
- **Root Directory**: `src/backend-django`
- **Start Command**: `cd rutinia && gunicorn rutinia.wsgi:application --bind 0.0.0.0:$PORT`

#### 4. Configurar MongoDB Atlas

Si aún no lo has hecho:

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Crea un usuario de base de datos
4. Obtén tu connection string
5. En Network Access, agrega `0.0.0.0/0` para permitir todas las conexiones

#### 5. Configurar Variables de Entorno en Railway

En el dashboard de tu proyecto en Railway:

1. Ve a la pestaña **"Variables"**
2. Agrega las siguientes variables:

```bash
SECRET_KEY=<genera-una-clave-segura>
DEBUG=False
ALLOWED_HOSTS=.railway.app
DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=rutinia
CORS_ALLOWED_ORIGINS=https://tu-frontend-vercel.vercel.app
PORT=8000
```

**Generar SECRET_KEY:**
```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 6. Desplegar

1. Railway desplegará automáticamente después de configurar las variables
2. O click en "Deploy" manualmente
3. Espera a que termine el build (3-5 minutos)

#### 7. Obtener la URL del backend

1. En el dashboard de Railway, verás tu servicio
2. Click en tu servicio
3. Ve a "Settings" → "Networking"
4. Click en "Generate Domain"
5. Copia la URL generada (ej: `https://tu-proyecto.up.railway.app`)

### 🔗 Conectar Frontend con Backend

Una vez que tengas la URL de Railway, configúrala en Vercel:

#### En Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   ```
   VITE_API_URL=https://tu-proyecto.up.railway.app/api
   ```
4. Redeploy el frontend

### ✅ Verificar el despliegue

**Backend funcionando:**
```bash
curl https://tu-proyecto.up.railway.app/api/
```

**Frontend conectado:**
1. Abre tu app en Vercel
2. Intenta hacer login/registro
3. Verifica que no haya errores de CORS

### 🐛 Solución de Problemas

#### Error: "Application failed to respond"
- Verifica que el `Procfile` esté en `src/backend-django/`
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en Railway Dashboard

#### Error: "Database connection failed"
- Verifica tu connection string de MongoDB
- Asegúrate de que `0.0.0.0/0` esté en Network Access de MongoDB Atlas

#### Error de CORS
- Verifica que `CORS_ALLOWED_ORIGINS` incluya la URL exacta de Vercel
- Ejemplo: `https://rutinia1.vercel.app` (sin slash final)

### 💰 Costos

- Railway: $5 USD de crédito gratis al mes
- MongoDB Atlas: Tier gratuito (512MB)
- Vercel: Tier gratuito para proyectos personales

### 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de CPU y memoria
- Reinicio automático en caso de fallo

---

**Siguiente paso:** Configura las variables de entorno en Vercel con la URL de Railway
