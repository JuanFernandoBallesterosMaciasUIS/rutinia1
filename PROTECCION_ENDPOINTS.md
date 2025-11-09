# 🔒 Protección de Endpoints con JWT

**Fecha**: 14 de octubre de 2025  
**Estado**: ✅ IMPLEMENTADO

---

## 🎯 Problema Identificado

Los endpoints de la API estaban **sin protección**, permitiendo acceso a cualquier usuario **sin autenticación**.

### ❌ Antes (SIN PROTECCIÓN)

```python
class HabitoViewSet(viewsets.ModelViewSet):
    serializer_class = HabitoSerializer
    # ❌ Cualquiera podía acceder
```

**Resultado**: Cualquier persona podía hacer `GET /api/habitos/` sin token.

---

## ✅ Solución Implementada

Se agregó `permission_classes = [IsAuthenticated]` a **TODOS** los ViewSets.

### ✅ Después (CON PROTECCIÓN)

```python
from rest_framework.permissions import IsAuthenticated

class HabitoViewSet(viewsets.ModelViewSet):
    serializer_class = HabitoSerializer
    permission_classes = [IsAuthenticated]  # ✅ Requiere JWT token
```

---

## 📋 Endpoints Protegidos

Todos los siguientes endpoints **AHORA REQUIEREN** autenticación JWT:

| Endpoint | ViewSet | Protección |
|----------|---------|------------|
| `/api/usuarios/` | UsuarioViewSet | ✅ IsAuthenticated |
| `/api/roles/` | RolViewSet | ✅ IsAuthenticated |
| `/api/categorias/` | CategoriaViewSet | ✅ IsAuthenticated |
| `/api/habitos/` | HabitoViewSet | ✅ IsAuthenticated |
| `/api/registros/` | RegistroHabitoViewSet | ✅ IsAuthenticated |
| `/api/tools/` | ToolViewSet | ✅ IsAuthenticated |

### Endpoints Públicos (Sin Protección)

Los siguientes endpoints **NO REQUIEREN** autenticación:

| Endpoint | Descripción | Razón |
|----------|-------------|-------|
| `/api/auth/register/` | Registro de usuarios | Necesario para crear cuenta |
| `/api/auth/login/` | Login | Necesario para obtener token |
| `/api/auth/refresh/` | Refrescar token | Público para renovar acceso |

---

## 🧪 Cómo Probar la Protección

### 1️⃣ **Sin Token (Debe FALLAR)**

```bash
# Request sin Authorization header
curl http://localhost:8000/api/habitos/

# Respuesta esperada:
{
  "detail": "Authentication credentials were not provided."
}
# Status: 401 Unauthorized
```

### 2️⃣ **Con Token Inválido (Debe FALLAR)**

```bash
curl -H "Authorization: Bearer token-falso-123" \
     http://localhost:8000/api/habitos/

# Respuesta esperada:
{
  "detail": "Given token not valid for any token type"
}
# Status: 401 Unauthorized
```

### 3️⃣ **Con Token Válido (Debe FUNCIONAR)**

```bash
# 1. Login para obtener token
curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{"correo":"juan@ejemplo.com","contrasena":"demo123"}'

# Respuesta:
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# 2. Usar access token en request
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:8000/api/habitos/

# Respuesta esperada:
[
  {
    "id": "68ed657c98ea988be00604d1",
    "nombre": "Ejercicio matutino",
    ...
  }
]
# Status: 200 OK ✅
```

---

## 🔐 Flujo de Autenticación

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login/
       │    (correo + contraseña)
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 2. Valida credenciales
       │    Genera JWT tokens
       ▼
┌─────────────┐
│   Cliente   │ ← access_token + refresh_token
└──────┬──────┘
       │
       │ 3. GET /api/habitos/
       │    Header: Authorization: Bearer <access_token>
       ▼
┌─────────────┐
│   Backend   │
└──────┬──────┘
       │
       │ 4. Verifica token JWT
       │    ✅ Token válido → Permite acceso
       │    ❌ Token inválido → 401 Unauthorized
       ▼
┌─────────────┐
│  Respuesta  │
└─────────────┘
```

---

## 📝 Cambios en el Código

### `views.py` - Importación

```python
from rest_framework.permissions import IsAuthenticated
```

### `views.py` - Aplicación en ViewSets

```python
class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [IsAuthenticated]  # ✅ AGREGADO

class UsuarioViewSet(viewsets.ModelViewSet):
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]  # ✅ AGREGADO

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]  # ✅ AGREGADO

class RegistroHabitoViewSet(viewsets.ModelViewSet):
    serializer_class = RegistroHabitoSerializer
    permission_classes = [IsAuthenticated]  # ✅ AGREGADO

class HabitoViewSet(viewsets.ModelViewSet):
    serializer_class = HabitoSerializer
    permission_classes = [IsAuthenticated]  # ✅ AGREGADO

class ToolViewSet(viewsets.ModelViewSet):
    lookup_field = 'id'
    serializer_class = ToolSerializer
    permission_classes = [IsAuthenticated]  # ✅ AGREGADO
```

---

## 🧐 ¿Cómo Funciona `IsAuthenticated`?

`IsAuthenticated` es una clase de permisos de Django REST Framework que:

1. **Verifica** que el request tenga el header `Authorization: Bearer <token>`
2. **Valida** que el token JWT sea válido (firma, expiración, formato)
3. **Extrae** los datos del usuario del token
4. **Asigna** el usuario a `request.user`
5. **Permite** el acceso si todo es válido
6. **Rechaza** con `401 Unauthorized` si falla cualquier validación

---

## ✅ Frontend - Integración Automática

Gracias a los **interceptores de Axios** implementados en `authService.js`, el frontend **automáticamente**:

1. ✅ Agrega el token JWT en cada request
2. ✅ Detecta errores 401 (token expirado)
3. ✅ Refresca el token automáticamente
4. ✅ Reintenta el request original

```javascript
// authService.js - Interceptor de Request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // ✅ Auto-agrega token
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

---

## 🎯 Resultado Final

### ✅ **Antes de Login**
- ❌ Usuario NO puede acceder a `/api/habitos/`
- ❌ Usuario NO puede acceder a `/api/usuarios/`
- ✅ Usuario SÍ puede acceder a `/api/auth/login/`
- ✅ Usuario SÍ puede acceder a `/api/auth/register/`

### ✅ **Después de Login**
- ✅ Usuario autenticado puede acceder a **TODOS** los endpoints
- ✅ Token se renueva automáticamente cada 5 horas
- ✅ Si token expira, se refresca automáticamente
- ✅ Si refresh falla, usuario es redirigido al login

---

## 🔧 Configuración de JWT (Recordatorio)

En `settings.py`:

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=5),    # Token de acceso válido por 5 horas
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),    # Token de refresh válido por 1 día
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

---

## 📊 Checklist de Seguridad

- [x] ✅ Todos los ViewSets protegidos con `IsAuthenticated`
- [x] ✅ Endpoints de autenticación públicos (`/auth/*`)
- [x] ✅ Frontend envía token automáticamente
- [x] ✅ Token se refresca automáticamente
- [x] ✅ SECRET_KEY en variable de entorno
- [x] ✅ Passwords hasheados con `make_password()`
- [ ] ⚠️ **PENDIENTE**: Limpiar historial de git

---

## 🚨 Prueba de Seguridad

### Método 1: Navegador

1. **Sin login**: Abre `http://localhost:8000/api/habitos/` en navegador
   - Deberías ver: `{"detail":"Authentication credentials were not provided."}`

2. **Con login**: 
   - Login en React (`http://localhost:5173`)
   - Abre DevTools → Network
   - Ve a Dashboard o Hábitos
   - Verifica que cada request tenga `Authorization: Bearer <token>` en headers

### Método 2: Postman

1. **Request sin token**:
   ```
   GET http://localhost:8000/api/habitos/
   (Sin headers)
   ```
   Resultado: `401 Unauthorized`

2. **Request con token**:
   ```
   GET http://localhost:8000/api/habitos/
   Headers:
     Authorization: Bearer <tu-access-token>
   ```
   Resultado: `200 OK` con datos

---

**✅ SEGURIDAD IMPLEMENTADA - Todos los endpoints ahora requieren autenticación JWT**

