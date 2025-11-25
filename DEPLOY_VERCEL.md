# Guía de Despliegue en Vercel - Rutinia

Esta guía te ayudará a desplegar tu aplicación Django + React en Vercel.

## 📋 Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. Cuenta en MongoDB Atlas (para la base de datos)
3. Repositorio de GitHub con el código

## 🔧 Configuración del Proyecto

### 1. Archivos de Configuración Creados

- ✅ `vercel.json` - Configuración principal de Vercel
- ✅ `src/backend-django/rutinia/vercel_app.py` - WSGI app para Vercel
- ✅ `src/backend-django/rutinia/build_files.sh` - Script de construcción
- ✅ `.env.example` - Plantilla de variables de entorno

### 2. Configuración de MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster (puedes usar el tier gratuito)
3. Configura las credenciales de acceso
4. Obtén tu connection string
5. Agrega las IPs de Vercel a la lista blanca (o usa `0.0.0.0/0` para permitir todas)

## 🚀 Despliegue en Vercel

### Opción 1: Desde la Interfaz Web de Vercel

1. **Conecta tu repositorio:**
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click en "New Project"
   - Importa tu repositorio de GitHub
   - Selecciona la rama `despliegueVercel`

   

2. **Configura las variables de entorno:**
   
   En la sección "Environment Variables", agrega:

   ```
   SECRET_KEY=tu-secret-key-super-segura
   DEBUG=False
   ALLOWED_HOSTS=.vercel.app
   DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
   MONGO_DB=rutinia
   CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
   ```

3. **Configuración del Build:**
   - Framework Preset: Other
   - Root Directory: `./`
   - Build Command: (déjalo vacío, usa vercel.json)
   - Output Directory: (déjalo vacío, usa vercel.json)

4. **Deploy:**
   - Click en "Deploy"
   - Espera a que termine el proceso

### Opción 2: Desde la CLI de Vercel

1. **Instala Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login en Vercel:**
   ```powershell
   vercel login
   ```

3. **Configura las variables de entorno:**
   ```powershell
   vercel env add SECRET_KEY
   vercel env add DEBUG
   vercel env add ALLOWED_HOSTS
   vercel env add DATABASE_URL
   vercel env add MONGO_DB
   vercel env add CORS_ALLOWED_ORIGINS
   ```

4. **Despliega:**
   ```powershell
   vercel --prod
   ```

## 🔐 Generar SECRET_KEY para Django

Puedes generar una nueva SECRET_KEY usando:

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

O usando el script incluido:
```powershell
cd src\backend-django\rutinia
python generate_secret_key.py
```

## 📝 Variables de Entorno Importantes

### Backend (Django):
- `SECRET_KEY`: Clave secreta de Django (genera una nueva para producción)
- `DEBUG`: Debe ser `False` en producción
- `ALLOWED_HOSTS`: `.vercel.app` o tu dominio personalizado
- `DATABASE_URL`: URL de conexión a MongoDB Atlas
- `MONGO_DB`: Nombre de la base de datos en MongoDB
- `CORS_ALLOWED_ORIGINS`: URLs permitidas para CORS (URL del frontend)

### Frontend (React):
- `VITE_API_URL`: URL del backend desplegado en Vercel

## 🔄 Actualizar el Frontend

Después del primer despliegue, actualiza la URL del API en tu frontend:

1. Crea un archivo `.env` en `src/frontend-react/`:
   ```
   VITE_API_URL=https://tu-proyecto.vercel.app/api
   ```

2. Actualiza tus archivos de configuración de Axios para usar:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
   ```

## ✅ Verificación Post-Despliegue

1. **Verifica el backend:**
   - Accede a `https://tu-proyecto.vercel.app/api/`
   - Deberías ver una respuesta de la API

2. **Verifica el frontend:**
   - Accede a `https://tu-proyecto.vercel.app/`
   - La aplicación React debería cargarse

3. **Prueba la autenticación:**
   - Intenta registrarte/iniciar sesión
   - Verifica que los tokens JWT funcionen

## 🐛 Solución de Problemas

### Error: "Module not found"
- Verifica que todas las dependencias estén en `requirements.txt`
- Asegúrate de que las versiones sean compatibles

### Error: "CORS policy"
- Verifica que `CORS_ALLOWED_ORIGINS` incluya la URL de tu frontend
- Asegúrate de que `django-cors-headers` esté instalado

### Error: "Database connection failed"
- Verifica tu connection string de MongoDB
- Asegúrate de que las IPs de Vercel estén en la lista blanca de MongoDB Atlas
- Verifica que el nombre de la base de datos sea correcto

### Error: "Static files not found"
- Los archivos estáticos se sirven automáticamente desde React
- Django solo maneja la API

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)

## 🔄 Actualizaciones Futuras

Para actualizar el despliegue:

1. **Haz push a GitHub:**
   ```powershell
   git add .
   git commit -m "Actualización"
   git push origin despliegueVercel
   ```

2. **Vercel desplegará automáticamente** los cambios

O usa la CLI:
```powershell
vercel --prod
```

## 📊 Monitoreo

Vercel proporciona:
- Logs en tiempo real
- Métricas de rendimiento
- Análisis de errores

Accede a estos en tu [Dashboard de Vercel](https://vercel.com/dashboard).

---

**¡Tu aplicación Rutinia está lista para producción en Vercel! 🎉**
