# Guía de Pruebas JWT - Rutinia Backend

## Configuración Inicial

Antes de probar, asegúrate de que:
1. El servidor Spring Boot esté corriendo en `http://localhost:8080`
2. La base de datos MySQL esté activa
3. Si tienes usuarios existentes, ejecuta la migración de contraseñas (ver instrucciones abajo)

## Migración de Contraseñas Existentes

Si ya tienes usuarios en la base de datos con contraseñas sin encriptar:

1. Abre el archivo `src/main/java/uis/edu/entorno/backend/util/MigracionPasswordsBCrypt.java`
2. Descomenta la línea `@Component` (quita el `//` al inicio)
3. Reinicia el servidor Spring Boot
4. El script migrará automáticamente todas las contraseñas
5. Una vez completado, vuelve a comentar `@Component` para evitar ejecuciones adicionales

## Pruebas con Postman

### 1. Registro de Usuario

**Endpoint:** `POST http://localhost:8080/api/auth/registro`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "María",
  "apellido": "González",
  "correo": "maria@example.com",
  "clave": "password123",
  "rol": {
    "idRol": 1
  },
  "tema": "light",
  "notificaciones": true
}
```

**Respuesta esperada (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBleGFtcGxlLmNvbSIsImlhdCI6MTcwMjY1...",
  "tipo": "Bearer",
  "idUsuario": 1,
  "nombre": "María González",
  "correo": "maria@example.com"
}
```

### 2. Login de Usuario

**Endpoint:** `POST http://localhost:8080/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombreUsuario": "maria@example.com",
  "password": "password123"
}
```

**Respuesta esperada (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBleGFtcGxlLmNvbSIsImlhdCI6MTcwMjY1...",
  "tipo": "Bearer",
  "idUsuario": 1,
  "nombre": "María González",
  "correo": "maria@example.com"
}
```

**Respuesta en caso de error (401 Unauthorized):**
```json
{
  "mensaje": "Credenciales inválidas",
  "error": "Bad credentials"
}
```

### 3. Validar Token

**Endpoint:** `GET http://localhost:8080/api/auth/validar`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBleGFtcGxlLmNvbSIsImlhdCI6MTcwMjY1...
```

**Respuesta esperada (200 OK):**
```json
{
  "valido": true,
  "usuario": "María González",
  "correo": "maria@example.com"
}
```

### 4. Obtener Lista de Usuarios (Endpoint Protegido)

**Endpoint:** `GET http://localhost:8080/api/usuarios/list`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtYXJpYUBleGFtcGxlLmNvbSIsImlhdCI6MTcwMjY1...
```

**Respuesta esperada (200 OK):**
```json
[
  {
    "idUsuario": 1,
    "nombre": "María",
    "apellido": "González",
    "correo": "maria@example.com",
    "tema": "light",
    "notificaciones": true,
    "rol": {
      "idRol": 1,
      "nombre": "USER"
    }
  }
]
```

**Sin token o con token inválido (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "No autorizado",
  "message": "Full authentication is required to access this resource",
  "path": "/api/usuarios/list"
}
```

## Pruebas con cURL (Línea de Comandos)

### Registro
```bash
curl -X POST http://localhost:8080/api/auth/registro ^
  -H "Content-Type: application/json" ^
  -d "{\"nombre\":\"Carlos\",\"apellido\":\"Ruiz\",\"correo\":\"carlos@example.com\",\"clave\":\"pass123\",\"rol\":{\"idRol\":1},\"tema\":\"dark\",\"notificaciones\":false}"
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"nombreUsuario\":\"carlos@example.com\",\"password\":\"pass123\"}"
```

### Obtener Usuarios (reemplaza YOUR_TOKEN con el token real)
```bash
curl -X GET http://localhost:8080/api/usuarios/list ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Pruebas con JavaScript/Fetch API

### HTML de Prueba

Crea un archivo `test-jwt.html` en la carpeta `static`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba JWT</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
        }
        .section {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        button {
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
        }
        button:hover {
            background: #0056b3;
        }
        pre {
            background: #f4f4f4;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
        }
        input {
            padding: 8px;
            margin: 5px;
            width: 200px;
        }
    </style>
</head>
<body>
    <h1>Pruebas de Autenticación JWT</h1>

    <div class="section">
        <h2>1. Registro</h2>
        <input type="email" id="regCorreo" placeholder="Correo">
        <input type="password" id="regPassword" placeholder="Contraseña">
        <input type="text" id="regNombre" placeholder="Nombre">
        <input type="text" id="regApellido" placeholder="Apellido">
        <button onclick="registrar()">Registrar</button>
    </div>

    <div class="section">
        <h2>2. Login</h2>
        <input type="email" id="loginCorreo" placeholder="Correo">
        <input type="password" id="loginPassword" placeholder="Contraseña">
        <button onclick="login()">Login</button>
    </div>

    <div class="section">
        <h2>3. Obtener Usuarios (Requiere Token)</h2>
        <button onclick="obtenerUsuarios()">Obtener Usuarios</button>
    </div>

    <div class="section">
        <h2>4. Validar Token</h2>
        <button onclick="validarToken()">Validar Token Actual</button>
    </div>

    <div class="section">
        <h2>Token Actual:</h2>
        <pre id="tokenActual">No hay token</pre>
    </div>

    <div class="section">
        <h2>Resultado:</h2>
        <pre id="resultado">Aquí se mostrarán los resultados</pre>
    </div>

    <script>
        const API_URL = 'http://localhost:8080';

        function mostrarResultado(data) {
            document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);
        }

        function mostrarToken() {
            const token = localStorage.getItem('token');
            document.getElementById('tokenActual').textContent = token || 'No hay token';
        }

        async function registrar() {
            const correo = document.getElementById('regCorreo').value;
            const password = document.getElementById('regPassword').value;
            const nombre = document.getElementById('regNombre').value;
            const apellido = document.getElementById('regApellido').value;

            try {
                const response = await fetch(`${API_URL}/api/auth/registro`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombre,
                        apellido,
                        correo,
                        clave: password,
                        rol: { idRol: 1 },
                        tema: 'light',
                        notificaciones: true
                    })
                });

                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    mostrarToken();
                    mostrarResultado({ mensaje: 'Registro exitoso', ...data });
                } else {
                    mostrarResultado({ error: 'Error en registro', ...data });
                }
            } catch (error) {
                mostrarResultado({ error: error.message });
            }
        }

        async function login() {
            const correo = document.getElementById('loginCorreo').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nombreUsuario: correo,
                        password: password
                    })
                });

                const data = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    mostrarToken();
                    mostrarResultado({ mensaje: 'Login exitoso', ...data });
                } else {
                    mostrarResultado({ error: 'Error en login', ...data });
                }
            } catch (error) {
                mostrarResultado({ error: error.message });
            }
        }

        async function obtenerUsuarios() {
            const token = localStorage.getItem('token');

            if (!token) {
                mostrarResultado({ error: 'No hay token. Por favor inicia sesión primero.' });
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/usuarios/list`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (response.ok) {
                    mostrarResultado({ mensaje: 'Usuarios obtenidos correctamente', usuarios: data });
                } else {
                    mostrarResultado({ error: 'Error al obtener usuarios', ...data });
                }
            } catch (error) {
                mostrarResultado({ error: error.message });
            }
        }

        async function validarToken() {
            const token = localStorage.getItem('token');

            if (!token) {
                mostrarResultado({ error: 'No hay token. Por favor inicia sesión primero.' });
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/validar`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                mostrarResultado(data);
            } catch (error) {
                mostrarResultado({ error: error.message });
            }
        }

        // Mostrar el token al cargar la página
        window.onload = mostrarToken;
    </script>
</body>
</html>
```

Para usar este archivo:
1. Copia el contenido en `src/main/resources/static/test-jwt.html`
2. Inicia el servidor
3. Abre `http://localhost:8080/test-jwt.html` en tu navegador

## Casos de Prueba

### ✅ Caso 1: Registro Exitoso
- **Input:** Usuario nuevo con todos los campos
- **Expected:** Token JWT generado, usuario creado en BD

### ✅ Caso 2: Login Exitoso
- **Input:** Credenciales correctas
- **Expected:** Token JWT válido

### ❌ Caso 3: Login Fallido
- **Input:** Contraseña incorrecta
- **Expected:** Error 401, mensaje "Credenciales inválidas"

### ❌ Caso 4: Acceso Sin Token
- **Input:** Petición a endpoint protegido sin header Authorization
- **Expected:** Error 401

### ❌ Caso 5: Token Inválido
- **Input:** Token manipulado o expirado
- **Expected:** Error 401

### ✅ Caso 6: Acceso Con Token Válido
- **Input:** Token válido en header Authorization
- **Expected:** Acceso permitido, datos retornados

## Verificación en Base de Datos

Después del registro, verifica en MySQL:

```sql
-- Ver usuarios y sus contraseñas encriptadas
SELECT idUsuario, nombre, correo, clave FROM Usuario;

-- Las contraseñas BCrypt comienzan con $2a$, $2b$ o $2y$
-- Ejemplo: $2a$10$N9qo8uLOickgx2ZMRZoMye/Qi1g9UUtgZ8cS7I8D7E7.S8fmOJ5q2
```

## Notas Importantes

1. **Token en LocalStorage:** En producción, considera usar httpOnly cookies para mayor seguridad
2. **Expiración:** Los tokens expiran en 24 horas (configurable en `application.properties`)
3. **CORS:** Asegúrate de que tu frontend esté en un origen permitido
4. **HTTPS:** En producción, siempre usa HTTPS para transmitir tokens

## Solución de Problemas Comunes

### Error: "Credenciales inválidas"
- Verifica que el correo esté correcto
- Asegúrate de que la contraseña sea la correcta
- Si migraste contraseñas, verifica que la migración se completó

### Error: "Token inválido"
- El token puede haber expirado (24 horas)
- Verifica que estés usando el formato correcto: `Bearer TOKEN`
- Asegúrate de no tener espacios extra en el header

### Error de CORS
- Verifica que tu origen esté en `SecurityConfig.java`
- Agrega tu URL a `allowedOrigins` si es necesario
