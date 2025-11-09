# Implementación de JWT en Rutinia

Se ha implementado autenticación JWT (JSON Web Token) para el proyecto Django + React.

## Cambios realizados en el Backend (Django)

### 1. Dependencias agregadas
- `djangorestframework-simplejwt==5.3.1` - Librería para JWT en Django REST Framework
- `PyJWT==2.8.0` - Librería para manejo de tokens JWT

### 2. Configuración en `settings.py`
- Agregado `rest_framework_simplejwt` a `INSTALLED_APPS`
- Configurado `REST_FRAMEWORK` con autenticación JWT
- Configurado `SIMPLE_JWT` con tiempos de vida de tokens:
  - Access token: 5 horas
  - Refresh token: 1 día

### 3. Nuevos endpoints de autenticación (`core/authentication.py`)
- `POST /api/auth/register/` - Registrar nuevo usuario
- `POST /api/auth/login/` - Iniciar sesión
- `POST /api/auth/refresh/` - Refrescar token de acceso
- `GET /api/auth/user/` - Obtener información del usuario autenticado
- `POST /api/auth/logout/` - Cerrar sesión

### 4. URLs actualizadas (`core/urls.py`)
Se agregaron las rutas de autenticación al router de la API.

## Cambios realizados en el Frontend (React)

### 1. Nuevo servicio de autenticación (`authService.js`)
- Manejo de tokens JWT (access y refresh)
- Interceptores de axios para:
  - Agregar automáticamente el token a cada petición
  - Refrescar el token cuando expira (401)
  - Redirigir al login si el refresh falla

### 2. Contexto de autenticación (`AuthContext.jsx`)
- Proveedor global de autenticación
- Hook `useAuth()` para acceder a funciones de autenticación en componentes
- Estado global del usuario

### 3. Actualización del componente Login
- Integrado con el nuevo servicio de autenticación
- Uso del contexto `useAuth`
- Manejo de tokens JWT

### 4. Actualización del main.jsx
- Envuelto la aplicación con `AuthProvider` para acceso global

## Instalación

### Backend
```powershell
cd src/backend-django/rutinia
pip install -r requirements.txt
```

### Frontend
```powershell
cd src/frontend-react
npm install
# o
yarn install
```

## Uso

### Registro de usuario
```javascript
const response = await authService.register({
  nombre: 'Juan',
  correo: 'juan@example.com',
  contrasena: 'password123',
  rol_id: 'user'
});
// Tokens se guardan automáticamente en localStorage
```

### Login
```javascript
const response = await authService.login('juan@example.com', 'password123');
// Tokens se guardan automáticamente en localStorage
```

### Hacer peticiones autenticadas
```javascript
import { apiClient } from './services/authService';

// El token se agrega automáticamente
const response = await apiClient.get('/habitos/');
```

### Usar en componentes
```javascript
import { useAuth } from './context/AuthContext';

function MiComponente() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>;
  }
  
  return <div>Hola {user.nombre}</div>;
}
```

## Flujo de autenticación

1. **Login/Register**: Usuario se autentica
2. **Tokens guardados**: Access y Refresh tokens se guardan en localStorage
3. **Peticiones API**: El access token se agrega automáticamente al header Authorization
4. **Token expira**: Si el access token expira (401), se intenta refrescar automáticamente
5. **Refresh exitoso**: Nueva petición con nuevo access token
6. **Refresh falla**: Limpiar tokens y redirigir al login

## Seguridad

- Los tokens se guardan en localStorage (considera usar httpOnly cookies para mayor seguridad)
- Access token expira en 5 horas
- Refresh token expira en 1 día
- Las contraseñas se hashean con `make_password` de Django

## Próximos pasos (opcional)

1. Implementar lista negra de tokens (token blacklist)
2. Agregar verificación de email
3. Implementar "recordar sesión"
4. Agregar roles y permisos más granulares
5. Implementar recuperación de contraseña

## Notas importantes

- La configuración actual usa `AllowAny` por defecto para permitir acceso sin autenticación
- Cada view/viewset puede requerir autenticación específicamente usando decoradores:
  ```python
  @permission_classes([IsAuthenticated])
  ```
- El proyecto usa MongoEngine, no el ORM de Django, por lo que se implementó autenticación custom
