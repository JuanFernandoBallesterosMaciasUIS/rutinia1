# Resumen de Configuración para Despliegue en Vercel

## 📁 Archivos Creados

### 1. Configuración de Vercel
- ✅ **`/vercel.json`** - Configuración principal de despliegue
  - Define builds para backend (Python) y frontend (React)
  - Configura rutas para API y frontend
  - Variables de entorno base

- ✅ **`/src/backend-django/rutinia/vercel.json`** - Configuración específica del backend
  - Configuración del runtime de Python
  - Definición de la aplicación WSGI

- ✅ **`/src/backend-django/rutinia/vercel_app.py`** - Punto de entrada WSGI
  - Aplicación WSGI compatible con Vercel
  - Importa configuración de Django

- ✅ **`/src/backend-django/rutinia/build_files.sh`** - Script de construcción
  - Instala dependencias
  - Recolecta archivos estáticos
  - Ejecuta migraciones

### 2. Documentación
- ✅ **`/DEPLOY_VERCEL.md`** - Guía completa de despliegue
  - Requisitos previos
  - Configuración de MongoDB Atlas
  - Instrucciones paso a paso
  - Solución de problemas
  - Verificación post-despliegue

- ✅ **`/.env.example`** - Plantilla de variables de entorno
  - Variables necesarias para Django
  - Variables necesarias para React
  - Configuración de base de datos

## 🔧 Archivos Modificados

### 1. Backend Django

#### `src/backend-django/rutinia/rutinia/settings.py`
```python
# Cambio 1: ALLOWED_HOSTS dinámico
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,.vercel.app').split(',')

# Cambio 2: Configuración de archivos estáticos para producción
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

# Cambio 3: CORS mejorado para producción
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173'
).split(',')

if not DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOW_ALL_ORIGINS = False
```

#### `src/backend-django/requirements.txt`
```txt
# Agregadas:
whitenoise==6.8.2  # Para servir archivos estáticos
gunicorn==23.0.0    # Servidor WSGI para producción
```

### 2. Frontend React

#### `src/frontend-react/package.json`
```json
{
  "scripts": {
    "vercel-build": "npm run build"  // Nuevo script para Vercel
  }
}
```

## 🚀 Próximos Pasos

### 1. Configurar MongoDB Atlas
1. Crear cuenta en MongoDB Atlas
2. Crear un nuevo cluster (tier gratuito disponible)
3. Configurar usuario y contraseña
4. Obtener connection string
5. Agregar `0.0.0.0/0` a IP Access List (o IPs específicas de Vercel)

### 2. Preparar Variables de Entorno

Para producción, necesitarás estas variables en Vercel:

```bash
# Backend
SECRET_KEY=<generar-nueva-clave-segura>
DEBUG=False
ALLOWED_HOSTS=.vercel.app
DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=rutinia
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
```

### 3. Generar SECRET_KEY

Ejecuta en la terminal:
```powershell
cd src\backend-django\rutinia
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Desplegar en Vercel

#### Opción A: Interfaz Web
1. Ir a https://vercel.com/new
2. Importar repositorio de GitHub
3. Seleccionar rama `despliegueVercel`
4. Agregar variables de entorno
5. Deploy

#### Opción B: CLI
```powershell
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Configurar variables de entorno
vercel env add SECRET_KEY
vercel env add DEBUG
vercel env add ALLOWED_HOSTS
vercel env add DATABASE_URL
vercel env add MONGO_DB
vercel env add CORS_ALLOWED_ORIGINS

# Desplegar
vercel --prod
```

### 5. Configurar Frontend después del despliegue

Crear `.env` en `src/frontend-react/`:
```
VITE_API_URL=https://tu-proyecto.vercel.app/api
```

Y actualizar el código de Axios para usar esta variable.

## ⚠️ Importante

### Antes de Desplegar:
- [ ] Generar nueva SECRET_KEY para producción
- [ ] Configurar MongoDB Atlas
- [ ] Verificar que todas las dependencias estén en requirements.txt
- [ ] Asegurarse de que `.env` esté en `.gitignore`
- [ ] Hacer commit de todos los cambios

### Después de Desplegar:
- [ ] Verificar que el backend responda en `/api/`
- [ ] Verificar que el frontend cargue correctamente
- [ ] Probar autenticación (login/registro)
- [ ] Verificar CORS
- [ ] Revisar logs en Vercel Dashboard

## 🔍 Verificación

### Backend funcionando:
```bash
curl https://tu-proyecto.vercel.app/api/
```

### Frontend funcionando:
```
https://tu-proyecto.vercel.app/
```

## 📚 Recursos

- [Guía completa de despliegue](./DEPLOY_VERCEL.md)
- [Documentación de Vercel](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)

## ✅ Checklist de Despliegue

- [x] Crear archivos de configuración de Vercel
- [x] Actualizar settings.py para producción
- [x] Agregar dependencias de producción
- [x] Crear documentación
- [ ] Configurar MongoDB Atlas
- [ ] Generar SECRET_KEY de producción
- [ ] Configurar variables de entorno en Vercel
- [ ] Hacer commit y push
- [ ] Desplegar en Vercel
- [ ] Verificar funcionamiento
- [ ] Configurar dominio personalizado (opcional)

---

**Estado:** ✅ Configuración completada - Listo para desplegar

**Próximo paso:** Configurar MongoDB Atlas y desplegar en Vercel
