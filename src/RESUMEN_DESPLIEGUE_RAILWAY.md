# ✅ Resumen: Backend Listo para Railway

## 📦 Archivos Creados

### 1. **requirements.txt** ✅
```
backend-django/rutinia/requirements.txt
```
- Django 5.2.7
- DRF, MongoEngine, JWT
- Gunicorn (servidor de producción)
- Whitenoise (archivos estáticos)

### 2. **Procfile** ✅
```
backend-django/rutinia/Procfile
```
- Comando: `web: gunicorn rutinia.wsgi --log-file -`
- Le dice a Railway cómo ejecutar tu app

### 3. **runtime.txt** ✅
```
backend-django/rutinia/runtime.txt
```
- Python 3.11.9

### 4. **settings.py actualizado** ✅
- `ALLOWED_HOSTS` dinámico (desde variable de entorno)
- WhiteNoise para archivos estáticos
- `CORS_ALLOWED_ORIGINS` dinámico
- Configuraciones de seguridad para producción
- `STATIC_ROOT` configurado

### 5. **.env.example actualizado** ✅
- Nuevas variables: `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
- Instrucciones claras para producción

### 6. **.gitignore actualizado** ✅
- Protege archivos `.env`
- Excluye `staticfiles/`
- Incluye `.env.example` (bueno compartir)

## 🎯 Próximos Pasos

### Paso 1: Git
```powershell
# Opción A: Rama de producción (RECOMENDADO)
git checkout -b production
git add .
git commit -m "feat: Configuración para Railway"
git push -u origin production

# Opción B: Usar main
git add .
git commit -m "feat: Configuración para Railway"
git push
```

### Paso 2: MongoDB Atlas
1. Crear cuenta: https://www.mongodb.com/cloud/atlas/register
2. Crear cluster M0 (gratis)
3. Crear usuario de BD
4. Whitelist: 0.0.0.0/0
5. Copiar connection string

### Paso 3: Railway
1. Crear proyecto: https://railway.app/
2. Deploy from GitHub repo
3. **Root Directory:** `backend-django/rutinia` ⚠️ IMPORTANTE
4. **Production Branch:** `production` (si usaste rama)

### Paso 4: Variables de Entorno en Railway
```bash
SECRET_KEY=genera-nueva-key-aqui
DEBUG=False
ALLOWED_HOSTS=*.railway.app
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
MONGO_DB=tracker_habitos_db
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/...
```

### Paso 5: Actualizar Frontend (Vercel)
```bash
VITE_API_URL=https://tu-app.up.railway.app
```

## 📂 Estructura para Railway

Railway buscará los archivos en:
```
tu-repo/
└── backend-django/
    └── rutinia/           ← Root Directory configurado aquí
        ├── requirements.txt  ✅
        ├── Procfile          ✅
        ├── runtime.txt       ✅
        ├── manage.py         ✅
        ├── .env.example      ✅
        ├── core/
        └── rutinia/
            └── settings.py   ✅ (actualizado)
```

## ❓ Preguntas Frecuentes

### ¿Necesito mover archivos?
❌ **NO.** Railway puede manejar subcarpetas con "Root Directory".

### ¿Las variables de entorno importan si están fuera de rutinia/?
❌ **NO.** Railway usa sus propias variables desde el Dashboard, no archivos `.env` locales.

### ¿Necesito rama separada?
✅ **SÍ, RECOMENDADO.** Usa `production` para deploys, `main` para desarrollo.

### ¿Cuánto cuesta?
- Railway: **$5 gratis/mes** → Después ~$5-10 USD/mes
- MongoDB Atlas: **M0 gratis para siempre**

## 🔍 Verificación

Antes de hacer push, verifica:
- [ ] `requirements.txt` existe en `backend-django/rutinia/`
- [ ] `Procfile` existe en `backend-django/rutinia/`
- [ ] `runtime.txt` existe en `backend-django/rutinia/`
- [ ] `.env` NO está en Git (solo `.env.example`)
- [ ] `settings.py` tiene configuraciones de producción

## 📚 Documentación Completa

Lee la guía completa en: **`GUIA_DESPLIEGUE_RAILWAY.md`**

---

**Todo listo para desplegar! 🚀**

Sigue la **GUIA_DESPLIEGUE_RAILWAY.md** paso a paso.
