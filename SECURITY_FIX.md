# 🔒 Solución al problema de GitGuardian - Credenciales Expuestas

## ⚠️ Problema detectado

GitGuardian detectó que se expusieron credenciales en el repositorio GitHub:
- **SECRET_KEY de Django** estaba hardcodeada en `settings.py`
- **Contraseñas de prueba** en archivos de seed (`create_sample_habits.py`, `seed_data.py`)

## ✅ Soluciones implementadas

### 1. SECRET_KEY movida a variables de entorno

**Antes (❌ INSEGURO):**
```python
SECRET_KEY = 'django-insecure-g%w-@c7bh&bp51@=b)kr*ilsjna*q&(snxkptz)ba@i2*_i6p-'
```

**Después (✅ SEGURO):**
```python
SECRET_KEY = config('SECRET_KEY', default='django-insecure-CHANGE-THIS-IN-PRODUCTION')
```

### 2. Archivo .env creado

Se creó un archivo `.env` con las variables sensibles:
```env
SECRET_KEY=tu-secret-key-real
DEBUG=True
```

### 3. .gitignore actualizado

Se agregaron las siguientes reglas para ignorar archivos sensibles:
```
.env
.env.local
**/.env
hash_existing_passwords.py
create_sample_habits.py
seed_data.py
```

### 4. .env.example creado

Se creó un archivo `.env.example` como plantilla (SIN datos reales):
```env
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
```

## 🚨 Acciones urgentes requeridas

### 1. Regenerar SECRET_KEY

La SECRET_KEY actual está comprometida. **DEBES cambiarla**:

```bash
cd src/backend-django/rutinia
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copia la nueva key y actualízala en tu archivo `.env`.

### 2. Limpiar historial de Git (CRÍTICO)

La SECRET_KEY antigua sigue en el historial de Git. Tienes dos opciones:

#### Opción A: Reescribir historial (Avanzado)
```bash
# ⚠️ CUIDADO: Esto reescribe el historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch src/backend-django/rutinia/rutinia/settings.py" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (requiere permisos)
git push origin --force --all
```

#### Opción B: Crear nuevo repositorio (Más fácil)
1. Crea un nuevo repositorio en GitHub
2. Cambia la SECRET_KEY en `.env`
3. Haz commit de los archivos limpios
4. Push al nuevo repositorio
5. Elimina el repositorio antiguo

### 3. Verificar que .env NO esté en Git

```bash
git status
# No debe aparecer .env en la lista

# Si aparece, quítalo:
git rm --cached src/backend-django/rutinia/.env
git commit -m "Remove .env from tracking"
```

## 📋 Checklist de seguridad

- [ ] Regenerar SECRET_KEY
- [ ] Actualizar `.env` con nueva SECRET_KEY
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Verificar que `.env` NO está trackeado por git
- [ ] Limpiar historial de Git o crear nuevo repo
- [ ] Actualizar SECRET_KEY en servidor de producción (si aplica)
- [ ] Revisar GitGuardian para marcar como resuelto

## 🔐 Mejores prácticas implementadas

1. ✅ Variables sensibles en `.env` (no en código)
2. ✅ `.env` en `.gitignore`
3. ✅ `.env.example` como plantilla
4. ✅ Usar `python-decouple` para cargar variables
5. ✅ Scripts con datos sensibles ignorados en git

## 📝 Para nuevos desarrolladores

1. Clonar el repositorio
2. Copiar `.env.example` a `.env`
3. Generar su propia SECRET_KEY:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```
4. Actualizar `.env` con su SECRET_KEY

## ⚡ Verificación rápida

```bash
# Verificar que .env NO esté en git
git ls-files | grep .env
# NO debe mostrar nada

# Verificar que settings.py use config()
grep "SECRET_KEY" src/backend-django/rutinia/rutinia/settings.py
# Debe mostrar: SECRET_KEY = config('SECRET_KEY', ...)
```

## 🌐 En producción

- Usa variables de entorno del servidor (Heroku, AWS, etc.)
- NUNCA uses archivos `.env` en producción
- Usa servicios como AWS Secrets Manager o HashiCorp Vault
- Habilita `DEBUG=False`
- Restringe `ALLOWED_HOSTS`

---

**Fecha de implementación**: 14 de octubre de 2025  
**Herramienta de detección**: GitGuardian  
**Estado**: ⚠️ Requiere regenerar SECRET_KEY y limpiar historial
