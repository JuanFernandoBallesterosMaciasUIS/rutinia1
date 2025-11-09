# 📬 Guía Completa: Probar JWT en Postman

**Fecha**: 14 de octubre de 2025  
**Backend**: Django + JWT  
**Base URL**: `http://localhost:8000/api`

---

## 🎯 Configuración Inicial de Postman

### 1. Crear una Colección Nueva

1. Abre Postman
2. Click en **"New"** → **"Collection"**
3. Nombre: **"Rutinia API - JWT"**
4. Click **"Create"**

---

## 🔐 PASO 1: Registro de Usuario (Opcional)

Si quieres crear un nuevo usuario:

### Request Configuration

```
Method: POST
URL: http://localhost:8000/api/auth/register/
```

### Headers

```
Content-Type: application/json
```

### Body (selecciona "raw" y "JSON")

```json
{
  "nombre": "Test",
  "apellido": "Usuario",
  "correo": "test@ejemplo.com",
  "contrasena": "password123",
  "rol": "68eca43f3a34b1a6e49f4921",
  "tema": "light"
}
```

### Respuesta Esperada (201 Created)

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5MDM...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MT...",
  "user": {
    "id": "68ed559598ea988be00604d0",
    "nombre": "Test",
    "apellido": "Usuario",
    "correo": "test@ejemplo.com"
  }
}
```

---

## 🔑 PASO 2: Login (Obtener Token JWT)

### Request Configuration

```
Method: POST
URL: http://localhost:8000/api/auth/login/
```

### Headers

```
Content-Type: application/json
```

### Body (raw → JSON)

```json
{
  "correo": "juan@ejemplo.com",
  "contrasena": "demo123"
}
```

### Respuesta Esperada (200 OK)

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5MDMyODQwLCJpYXQiOjE3MjkwMTQ4NDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoiNjhlZDU1OTU5OGVhOTg4YmUwMDYwNGQwIn0.ABC123...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcyOTEwMTI0MCwiaWF0IjoxNzI5MDE0ODQwLCJqdGkiOiI5ODc2NTQzMjEwIiwidXNlcl9pZCI6IjY4ZWQ1NTk1OThlYTk4OGJlMDA2MDRkMCJ9.XYZ789...",
  "user": {
    "id": "68ed559598ea988be00604d0",
    "nombre": "Juan Fernando",
    "apellido": "Ballesteros Macias",
    "correo": "juan@ejemplo.com",
    "rol": "68eca43f3a34b1a6e49f4921",
    "tema": "light"
  }
}
```

### 📝 Importante:
**Copia el valor de `access` (el token JWT)**. Lo necesitarás para los siguientes requests.

---

## 📊 PASO 3: Obtener Hábitos (Con Autenticación)

Ahora vamos a probar un endpoint protegido.

### Request Configuration

```
Method: GET
URL: http://localhost:8000/api/habitos/
```

### Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI5MDMyODQwLCJpYXQiOjE3MjkwMTQ4NDAsImp0aSI6IjEyMzQ1Njc4OTAiLCJ1c2VyX2lkIjoiNjhlZDU1OTU5OGVhOTg4YmUwMDYwNGQwIn0.ABC123...
```

⚠️ **IMPORTANTE**: Reemplaza `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` con tu **access token** real del PASO 2.

### 🎯 Formato del Header:
```
Authorization: Bearer <TU_ACCESS_TOKEN_AQUÍ>
```

### Respuesta Esperada (200 OK)

```json
[
  {
    "id": "68ed657c98ea988be00604d1",
    "nombre": "Ejercicio matutino",
    "descripcion": "30 minutos de ejercicio",
    "categoria": "68eca48e3a34b1a6e49f4922",
    "dificultad": "Media",
    "tipo_frecuencia": "Diario",
    "dias": [],
    "fecha_inicio": "2025-10-10",
    "publico": false,
    "activo": true,
    "usuario": "68ed559598ea988be00604d0",
    "icon": "dumbbell",
    "color": "#ef4444"
  },
  ...
]
```

---

## ❌ PASO 4: Probar Sin Token (Debe Fallar)

Para verificar que la protección funciona:

### Request Configuration

```
Method: GET
URL: http://localhost:8000/api/habitos/
```

### Headers

```
(No agregues ningún header de Authorization)
```

### Respuesta Esperada (401 Unauthorized)

```json
{
  "detail": "Authentication credentials were not provided."
}
```

✅ **Esto es CORRECTO** - confirma que el endpoint está protegido.

---

## 🔄 PASO 5: Refrescar Token (Cuando Expire)

Cuando el access token expire (después de 5 horas), usa este endpoint:

### Request Configuration

```
Method: POST
URL: http://localhost:8000/api/auth/refresh/
```

### Headers

```
Content-Type: application/json
```

### Body (raw → JSON)

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcyOTEwMTI0MCwiaWF0IjoxNzI5MDE0ODQwLCJqdGkiOiI5ODc2NTQzMjEwIiwidXNlcl9pZCI6IjY4ZWQ1NTk1OThlYTk4OGJlMDA2MDRkMCJ9.XYZ789..."
}
```

⚠️ Usa el **refresh token** que obtuviste en el login.

### Respuesta Esperada (200 OK)

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NUEVO_TOKEN_AQUI..."
}
```

---

## 👤 PASO 6: Obtener Información del Usuario Autenticado

### Request Configuration

```
Method: GET
URL: http://localhost:8000/api/auth/user/
```

### Headers

```
Authorization: Bearer <TU_ACCESS_TOKEN>
```

### Respuesta Esperada (200 OK)

```json
{
  "id": "68ed559598ea988be00604d0",
  "nombre": "Juan Fernando",
  "apellido": "Ballesteros Macias",
  "correo": "juan@ejemplo.com",
  "rol": "68eca43f3a34b1a6e49f4921",
  "tema": "light"
}
```

---

## 📋 Otros Endpoints Protegidos

Todos estos endpoints requieren el header `Authorization: Bearer <token>`:

### 1. **Obtener Usuarios**
```
GET http://localhost:8000/api/usuarios/
Headers: Authorization: Bearer <token>
```

### 2. **Crear Nuevo Hábito**
```
POST http://localhost:8000/api/habitos/
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "nombre": "Leer 30 minutos",
  "descripcion": "Lectura diaria",
  "categoria": "68eca48e3a34b1a6e49f4922",
  "dificultad": "Facil",
  "tipo_frecuencia": "Diario",
  "dias": [],
  "fecha_inicio": "2025-10-14",
  "publico": false,
  "activo": true,
  "usuario": "68ed559598ea988be00604d0",
  "icon": "book",
  "color": "#3b82f6"
}
```

### 3. **Obtener Registros de un Hábito**
```
GET http://localhost:8000/api/registros/?habito=68ed657c98ea988be00604d1
Headers: Authorization: Bearer <token>
```

### 4. **Marcar Hábito como Completado**
```
POST http://localhost:8000/api/registros/toggle_completado/
Headers: 
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "habito_id": "68ed657c98ea988be00604d1",
  "fecha": "2025-10-14",
  "completado": true
}
```

### 5. **Progreso Semanal de un Hábito**
```
GET http://localhost:8000/api/habitos/68ed657c98ea988be00604d1/progreso_semanal/
Headers: Authorization: Bearer <token>
```

### 6. **Progreso Mensual de un Hábito**
```
GET http://localhost:8000/api/habitos/68ed657c98ea988be00604d1/progreso_mensual/
Headers: Authorization: Bearer <token>
```

---

## 🎨 Configurar Variables de Entorno en Postman

Para no estar copiando el token manualmente cada vez:

### 1. Crear Variables de Colección

1. Click en tu colección **"Rutinia API - JWT"**
2. Ve a la pestaña **"Variables"**
3. Agrega estas variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:8000/api` | `http://localhost:8000/api` |
| `access_token` | (vacío) | (vacío) |
| `refresh_token` | (vacío) | (vacío) |

### 2. Usar Variables en Requests

En lugar de escribir la URL completa:
```
URL: {{base_url}}/habitos/
```

En lugar del token completo:
```
Authorization: Bearer {{access_token}}
```

### 3. Guardar Token Automáticamente con Script

En el request de **Login**, ve a la pestaña **"Tests"** y agrega:

```javascript
// Guardar tokens en variables de colección
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("access_token", jsonData.access);
    pm.collectionVariables.set("refresh_token", jsonData.refresh);
    
    console.log("✅ Tokens guardados automáticamente");
    console.log("Access token:", jsonData.access.substring(0, 50) + "...");
}
```

Ahora cada vez que hagas login, el token se guardará automáticamente. 🎉

---

## 🔧 Configurar Authorization a Nivel de Colección

Para no agregar el header manualmente en cada request:

### 1. Click en tu colección
2. Ve a la pestaña **"Authorization"**
3. Selecciona **Type**: `Bearer Token`
4. En **Token**: escribe `{{access_token}}`
5. Click **"Save"**

Ahora todos los requests heredarán automáticamente la autenticación. ✅

### En cada request individual:
- Ve a **"Authorization"**
- Selecciona **"Inherit auth from parent"**

---

## 📊 Colección Completa de Requests

Aquí está el orden recomendado:

```
📁 Rutinia API - JWT
│
├── 🔐 Auth
│   ├── 1. Register (POST /auth/register/)
│   ├── 2. Login (POST /auth/login/)
│   ├── 3. Refresh Token (POST /auth/refresh/)
│   ├── 4. Get User Info (GET /auth/user/)
│   └── 5. Logout (POST /auth/logout/)
│
├── 👤 Usuarios
│   ├── Get All Users (GET /usuarios/)
│   ├── Get User by ID (GET /usuarios/:id/)
│   └── Update User (PATCH /usuarios/:id/)
│
├── 🎯 Hábitos
│   ├── Get All Habits (GET /habitos/)
│   ├── Get Habit by ID (GET /habitos/:id/)
│   ├── Create Habit (POST /habitos/)
│   ├── Update Habit (PATCH /habitos/:id/)
│   ├── Delete Habit (DELETE /habitos/:id/)
│   ├── Progreso Semanal (GET /habitos/:id/progreso_semanal/)
│   └── Progreso Mensual (GET /habitos/:id/progreso_mensual/)
│
├── 📝 Registros
│   ├── Get Registros (GET /registros/)
│   ├── Get Registros by Habito (GET /registros/?habito=:id)
│   └── Toggle Completado (POST /registros/toggle_completado/)
│
└── 🏷️ Categorías
    └── Get All Categories (GET /categorias/)
```

---

## 🧪 Test de Seguridad en Postman

### Crear un Test para Verificar Autenticación

En cualquier request protegido, ve a **"Tests"** y agrega:

```javascript
// Verificar que sin token devuelve 401
pm.test("Endpoint protegido requiere autenticación", function () {
    if (!pm.request.headers.has("Authorization")) {
        pm.expect(pm.response.code).to.equal(401);
    }
});

// Verificar que con token válido devuelve 200
pm.test("Token válido permite acceso", function () {
    if (pm.request.headers.has("Authorization")) {
        pm.expect(pm.response.code).to.be.oneOf([200, 201]);
    }
});
```

---

## 🚨 Errores Comunes y Soluciones

### Error 1: `401 Unauthorized`

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Solución**: Agrega el header `Authorization: Bearer <token>`

---

### Error 2: `401 - Given token not valid`

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

**Solución**: 
- El token expiró (5 horas)
- Usa el endpoint `/auth/refresh/` con tu refresh token
- O vuelve a hacer login

---

### Error 3: `404 Not Found`

```json
{
  "detail": "Not found."
}
```

**Solución**: Verifica la URL, probablemente el ID del recurso no existe.

---

### Error 4: Token mal formateado

**Síntoma**: El header no funciona

**Solución**: Verifica el formato exacto:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Nota**: Debe haber un **espacio** entre `Bearer` y el token.

---

## 📥 Importar Colección Pre-configurada (JSON)

Guarda esto como `Rutinia_API_Collection.json`:

```json
{
  "info": {
    "name": "Rutinia API - JWT",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "if (pm.response.code === 200) {",
                  "    var jsonData = pm.response.json();",
                  "    pm.collectionVariables.set(\"access_token\", jsonData.access);",
                  "    pm.collectionVariables.set(\"refresh_token\", jsonData.refresh);",
                  "}"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"correo\": \"juan@ejemplo.com\",\n  \"contrasena\": \"demo123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login/",
              "host": ["{{base_url}}"],
              "path": ["auth", "login", ""]
            }
          }
        },
        {
          "name": "Get User Info",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{access_token}}"
                }
              ]
            },
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/auth/user/",
              "host": ["{{base_url}}"],
              "path": ["auth", "user", ""]
            }
          }
        }
      ]
    },
    {
      "name": "Habitos",
      "item": [
        {
          "name": "Get All Habits",
          "request": {
            "auth": {
              "type": "bearer",
              "bearer": [
                {
                  "key": "token",
                  "value": "{{access_token}}"
                }
              ]
            },
            "method": "GET",
            "url": {
              "raw": "{{base_url}}/habitos/",
              "host": ["{{base_url}}"],
              "path": ["habitos", ""]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000/api"
    },
    {
      "key": "access_token",
      "value": ""
    },
    {
      "key": "refresh_token",
      "value": ""
    }
  ]
}
```

**Para importar**:
1. Abre Postman
2. Click **"Import"**
3. Selecciona el archivo `Rutinia_API_Collection.json`
4. Click **"Import"**

---

## ✅ Checklist de Pruebas

- [ ] Login exitoso con credenciales válidas
- [ ] Token guardado en variables
- [ ] Acceso a `/habitos/` con token funciona
- [ ] Acceso a `/habitos/` sin token devuelve 401
- [ ] Token inválido devuelve 401
- [ ] Refresh token genera nuevo access token
- [ ] Crear hábito con token funciona
- [ ] Obtener información de usuario funciona

---

## 🎉 ¡Listo!

Ahora tienes todo configurado para probar tu API JWT en Postman. 

**Resumen rápido**:
1. 🔑 Haz login → Obtienes `access_token`
2. 📋 Copia el token
3. 🔐 Agrégalo en header: `Authorization: Bearer <token>`
4. ✅ Accede a endpoints protegidos

**¿Preguntas?** Consulta esta guía en cualquier momento. 📚

