# Pruebas de Autenticación JWT

## 🚀 Cómo iniciar el proyecto

### 1. Backend (Django)
```powershell
cd "src\backend-django"
.\venv\Scripts\Activate.ps1
cd rutinia
python manage.py runserver
```

El backend estará en: `http://localhost:8000`

### 2. Frontend (React)
```powershell
cd "src\frontend-react"
npm run dev
```

El frontend estará en: `http://localhost:5173`

## 🧪 Pruebas con Postman/Thunder Client

### 1. Registrar un usuario
**POST** `http://localhost:8000/api/auth/register/`

**Body (JSON):**
```json
{
  "nombre": "Juan Test",
  "correo": "juan@test.com",
  "contrasena": "password123",
  "rol_id": "user"
}
```

**Respuesta esperada:**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "...",
    "nombre": "Juan Test",
    "correo": "juan@test.com",
    "rol_id": "user"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 2. Iniciar sesión
**POST** `http://localhost:8000/api/auth/login/`

**Body (JSON):**
```json
{
  "correo": "juan@test.com",
  "contrasena": "password123"
}
```

**Respuesta esperada:**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "...",
    "nombre": "Juan Test",
    "correo": "juan@test.com",
    "rol_id": "user"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### 3. Obtener información del usuario (requiere autenticación)
**GET** `http://localhost:8000/api/auth/user/`

**Headers:**
```
Authorization: Bearer <tu_access_token>
```

**Respuesta esperada:**
```json
{
  "id": "...",
  "nombre": "Juan Test",
  "correo": "juan@test.com",
  "rol_id": "user"
}
```

### 4. Refrescar el token
**POST** `http://localhost:8000/api/auth/refresh/`

**Body (JSON):**
```json
{
  "refresh": "tu_refresh_token_aqui"
}
```

**Respuesta esperada:**
```json
{
  "access": "nuevo_access_token_aqui"
}
```

### 5. Cerrar sesión
**POST** `http://localhost:8000/api/auth/logout/`

**Headers:**
```
Authorization: Bearer <tu_access_token>
```

**Respuesta esperada:**
```json
{
  "message": "Sesión cerrada exitosamente"
}
```

## 🌐 Pruebas desde el Frontend

### Flujo completo:

1. **Abre el navegador** en `http://localhost:5173`

2. **Verás la pantalla de Login/Registro**

3. **Para registrarte:**
   - Cambia a la pestaña "Registrarse"
   - Completa el formulario
   - Haz clic en "Crear Cuenta"
   - Serás redirigido automáticamente

4. **Para iniciar sesión:**
   - Usa la pestaña "Iniciar Sesión"
   - Ingresa correo y contraseña
   - Haz clic en "Iniciar Sesión"

5. **El token se guarda automáticamente** en localStorage

6. **Todas las peticiones subsiguientes** incluirán automáticamente el token

## 🔍 Verificar tokens en localStorage

Abre las **DevTools del navegador** (F12):

```javascript
// Ver el access token
localStorage.getItem('access_token')

// Ver el refresh token
localStorage.getItem('refresh_token')

// Ver la información del usuario
localStorage.getItem('user')
```

## 🐛 Solución de problemas

### Error: "Failed to resolve import axios"
```powershell
cd src\frontend-react
npm install axios
```

### Error: "ModuleNotFoundError: No module named 'decouple'"
```powershell
cd src\backend-django
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Error: CORS
Asegúrate de que en `settings.py` esté configurado:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
]
```

### Token expirado
El frontend automáticamente intenta refrescar el token cuando expira. Si falla, te redirigirá al login.

## ✅ Checklist de funcionalidades

- ✅ Registro de usuarios con hash de contraseñas
- ✅ Login con validación de credenciales
- ✅ Generación de tokens JWT (access + refresh)
- ✅ Almacenamiento automático de tokens
- ✅ Interceptor para agregar token a peticiones
- ✅ Refresco automático de tokens expirados
- ✅ Redirección automática al login si falla
- ✅ Logout con limpieza de tokens
- ✅ Contexto global de autenticación
- ✅ Hook `useAuth()` para componentes

## 📝 Notas importantes

1. **Access token expira en 5 horas**
2. **Refresh token expira en 1 día**
3. Los tokens se guardan en **localStorage** (no en cookies httpOnly)
4. El backend usa **MongoEngine**, no el ORM de Django
5. Las contraseñas se hashean con `make_password` de Django
6. La configuración actual permite acceso sin autenticación por defecto (cada endpoint puede requerir auth específicamente)

## 🎯 Próximos pasos sugeridos

1. **Proteger endpoints específicos** agregando `@permission_classes([IsAuthenticated])`
2. **Implementar lista negra de tokens** para logout real
3. **Agregar verificación de email**
4. **Implementar "recordar sesión"**
5. **Agregar recuperación de contraseña**
6. **Migrar tokens a cookies httpOnly** para mayor seguridad
