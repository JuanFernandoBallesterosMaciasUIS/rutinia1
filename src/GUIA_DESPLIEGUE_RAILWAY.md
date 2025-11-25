# 🚀 Guía de Despliegue en Railway - Backend Django

## 📋 Pre-requisitos

✅ **Archivos creados:**
- `requirements.txt` - Dependencias de Python
- `Procfile` - Comando para ejecutar la aplicación
- `runtime.txt` - Versión de Python (3.11.9)
- `settings.py` - Actualizado para producción
- `.env.example` - Plantilla de variables de entorno

## 🗂️ Estructura del Proyecto

Tu proyecto Django está en: `backend-django/rutinia/`

**NO hay problema** con que tu proyecto Django esté en esta carpeta. Railway puede manejarlo perfectamente configurando el "Root Directory".

## 🌿 Paso 1: Preparar Git

### Opción A: Rama de Producción (RECOMENDADO)

```bash
# 1. Asegúrate de estar en la rama main
git checkout main
git pull

# 2. Crea una rama de producción
git checkout -b production

# 3. Añade los archivos nuevos
git add backend-django/rutinia/requirements.txt
git add backend-django/rutinia/Procfile
git add backend-django/rutinia/runtime.txt
git add backend-django/rutinia/rutinia/settings.py
git add backend-django/rutinia/.env.example

# 4. Commit
git commit -m "feat: Configuración para despliegue en Railway"

# 5. Push a GitHub
git push -u origin production
```

### Opción B: Usar Main directamente

```bash
# Si prefieres usar main (no recomendado para producción)
git add .
git commit -m "feat: Configuración para despliegue en Railway"
git push
```

## 🗄️ Paso 2: Configurar MongoDB Atlas (Base de Datos en la Nube)

### 2.1. Crear cuenta en MongoDB Atlas

1. Ve a https://www.mongodb.com/cloud/atlas/register
2. Crea una cuenta gratuita (tier M0 - gratis para siempre)
3. Crea un nuevo proyecto llamado "Rutinia"

### 2.2. Crear Cluster

1. Click en "Build a Database"
2. Selecciona **M0 FREE** (512MB storage)
3. Selecciona un proveedor (AWS, Google Cloud, Azure) y región cercana
4. Dale nombre al cluster: `rutinia-cluster`
5. Click en "Create"

### 2.3. Configurar Acceso

#### 2.3.1. Crear usuario de base de datos

1. En "Security" → "Database Access" → "Add New Database User"
2. Username: `rutinia_user` (guarda esto)
3. Password: **Genera una contraseña segura** (guarda esto)
4. Database User Privileges: **Read and write to any database**
5. Click "Add User"

#### 2.3.2. Whitelist IPs (permitir conexiones)

1. En "Security" → "Network Access" → "Add IP Address"
2. Click en **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
   - Railway usa IPs dinámicas, por eso necesitamos esto
3. Click "Confirm"

### 2.4. Obtener Connection String

1. Click en "Connect" en tu cluster
2. Selecciona "Connect your application"
3. Driver: **Python**, Version: **3.11 or later**
4. Copia el connection string, se ve así:

```
mongodb+srv://rutinia_user:<password>@rutinia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. **Reemplaza `<password>`** con la contraseña que creaste
6. **Guarda este string completo** - lo necesitarás en Railway

## 🚂 Paso 3: Crear Proyecto en Railway

### 3.1. Crear cuenta

1. Ve a https://railway.app/
2. Registrate con GitHub (recomendado)
3. Railway te da **$5 de crédito gratis** cada mes

### 3.2. Crear nuevo proyecto

1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca tu repositorio `Rutinia-1.0`
4. Selecciónalo

### 3.3. Configurar Root Directory

**IMPORTANTE:** Como tu Django está en `backend-django/rutinia/`, debes configurar esto:

1. En el dashboard del proyecto, click en tu servicio
2. Ve a "Settings"
3. Busca **"Root Directory"**
4. Ingresa: `backend-django/rutinia`
5. Click "Update"

### 3.4. Configurar la rama (si usaste production)

1. En "Settings" → "Source"
2. Busca **"Production Branch"**
3. Cambia de `main` a `production`
4. Click "Update"

## 🔐 Paso 4: Configurar Variables de Entorno en Railway

1. En el dashboard del proyecto, click en tu servicio
2. Ve a la pestaña **"Variables"**
3. Añade las siguientes variables (una por una):

```bash
# Django Configuration
SECRET_KEY=genera-una-nueva-key-segura-aqui
DEBUG=False

# Hosts - Railway te asigna un dominio
ALLOWED_HOSTS=*.railway.app,tu-app.up.railway.app

# CORS - Añade tu frontend de Vercel
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app,http://localhost:5173

# MongoDB Atlas (usa el connection string que copiaste antes)
MONGO_DB=tracker_habitos_db
DATABASE_URL=mongodb+srv://rutinia_user:TU_PASSWORD@rutinia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 4.1. Generar SECRET_KEY segura

Ejecuta en tu terminal local:

```powershell
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copia el resultado y úsalo como `SECRET_KEY` en Railway.

### 4.2. Obtener el dominio de Railway

Después del primer deploy:
1. Railway te asigna un dominio como: `tu-app.up.railway.app`
2. Cópialo y actualiza `ALLOWED_HOSTS`:
   - Ve a Variables
   - Edita `ALLOWED_HOSTS`
   - Cambia por: `tu-app.up.railway.app,*.railway.app`

## 🚀 Paso 5: Deploy

1. Railway debería detectar automáticamente que es un proyecto Django
2. Usará el `Procfile` que creamos
3. Instalará dependencias de `requirements.txt`
4. Click en **"Deploy"** si no lo hizo automáticamente
5. Espera 3-5 minutos para el primer deploy

### 5.1. Ver logs

1. En el dashboard, click en tu servicio
2. Ve a la pestaña **"Deployments"**
3. Click en el deployment activo
4. Verás los logs en tiempo real

### 5.2. Verificar que funcionó

1. Railway te dará una URL: `https://tu-app.up.railway.app`
2. Abre en el navegador: `https://tu-app.up.railway.app/api/usuarios/`
3. Deberías ver la respuesta de tu API

## 🔗 Paso 6: Conectar Frontend (Vercel) con Backend (Railway)

### 6.1. Actualizar variables en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Actualiza o añade:

```bash
VITE_API_URL=https://tu-app.up.railway.app
```

4. Redeploy tu frontend en Vercel

### 6.2. Actualizar CORS en Railway

1. Copia la URL de tu frontend de Vercel (ej: `https://rutinia.vercel.app`)
2. En Railway → Variables
3. Actualiza `CORS_ALLOWED_ORIGINS`:

```bash
CORS_ALLOWED_ORIGINS=https://rutinia.vercel.app
```

4. Railway hará redeploy automáticamente

## 🧪 Paso 7: Inicializar Base de Datos

### 7.1. Ejecutar comando de migración (si es necesario)

Railway no tiene SSH, pero puedes ejecutar comandos:

1. En Railway, ve a tu servicio
2. Click en **"Settings"** → **"Deploy Trigger"**
3. O usa Railway CLI localmente:

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link a tu proyecto
railway link

# Ejecutar comandos
railway run python manage.py createsuperuser
```

### 7.2. Seed Data (opcional)

Si necesitas datos iniciales:
- Puedes ejecutar tus scripts de seed usando Railway CLI
- O hacerlo manualmente desde tu app

## ✅ Checklist Final

- [ ] MongoDB Atlas configurado con usuario y whitelist
- [ ] Archivos de deploy creados (requirements.txt, Procfile, runtime.txt)
- [ ] settings.py actualizado para producción
- [ ] Rama production creada y pusheada a GitHub
- [ ] Proyecto Railway creado desde GitHub
- [ ] Root Directory configurado: `backend-django/rutinia`
- [ ] Variables de entorno configuradas en Railway
- [ ] ALLOWED_HOSTS actualizado con dominio de Railway
- [ ] Deploy exitoso (logs sin errores)
- [ ] CORS actualizado con frontend de Vercel
- [ ] Frontend actualizado con VITE_API_URL
- [ ] Pruebas exitosas: Login, crear hábito, notificaciones

## 🐛 Troubleshooting

### Error: "Application failed to respond"

- Revisa logs en Railway
- Verifica que `Procfile` esté en la carpeta correcta
- Verifica que `Root Directory` sea `backend-django/rutinia`

### Error: "MongoDB connection failed"

- Verifica que el `DATABASE_URL` sea correcto
- Verifica que la contraseña no tenga caracteres especiales sin encodear
- Verifica que 0.0.0.0/0 esté en Network Access de MongoDB Atlas

### Error CORS

- Verifica `CORS_ALLOWED_ORIGINS` en Railway
- Asegúrate de incluir `https://` en la URL de Vercel
- No incluyas barra al final: ❌ `https://app.vercel.app/` ✅ `https://app.vercel.app`

### Error 500

- Activa DEBUG temporalmente: `DEBUG=True` en Railway
- Revisa logs detallados
- Verifica `ALLOWED_HOSTS`

## 📊 Costos

Railway:
- **$5 USD de crédito gratis** cada mes
- Después: ~$5-10 USD/mes dependiendo uso
- Incluye: 500 horas de ejecución, 100GB transferencia

MongoDB Atlas:
- **M0 Tier: GRATIS para siempre**
- 512MB storage (suficiente para comenzar)

## 🔄 Workflow Recomendado

```
┌─────────────┐
│   Local     │ ← Desarrollas aquí
│  (develop)  │
└──────┬──────┘
       │ git push
       ▼
┌─────────────┐
│   GitHub    │
│  (develop)  │
└──────┬──────┘
       │ merge to main
       ▼
┌─────────────┐
│   GitHub    │
│   (main)    │
└──────┬──────┘
       │ merge to production
       ▼
┌─────────────┐
│   GitHub    │ ← Railway escucha esta rama
│ (production)│
└──────┬──────┘
       │ auto-deploy
       ▼
┌─────────────┐
│   Railway   │ ← Backend en producción
│  (backend)  │
└─────────────┘
       │ API calls
       ▼
┌─────────────┐
│   Vercel    │ ← Frontend en producción
│  (frontend) │
└─────────────┘
```

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)

---

¡Tu backend está listo para producción! 🎉
