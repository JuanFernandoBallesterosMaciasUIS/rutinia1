# Autenticación JWT en Spring Boot - Rutinia

## Descripción
Este proyecto implementa autenticación JWT (JSON Web Token) para el backend de Spring Boot de Rutinia.

## Características

- **Autenticación basada en tokens JWT**
- **Encriptación de contraseñas con BCrypt**
- **Spring Security configurado**
- **CORS habilitado para frontend React**
- **Endpoints protegidos y públicos**

## Endpoints de Autenticación

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "usuario@correo.com",
  "password": "contraseña"
}
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "idUsuario": 1,
  "nombre": "Juan Pérez",
  "correo": "usuario@correo.com"
}
```

### 2. Registro
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "usuario@correo.com",
  "clave": "contraseña123",
  "rol": {
    "idRol": 1
  },
  "tema": "light",
  "notificaciones": true
}
```

**Respuesta exitosa:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tipo": "Bearer",
  "idUsuario": 1,
  "nombre": "Juan Pérez",
  "correo": "usuario@correo.com"
}
```

### 3. Validar Token
```http
GET /api/auth/validar
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa:**
```json
{
  "valido": true,
  "usuario": "Juan Pérez",
  "correo": "usuario@correo.com"
}
```

## Uso del Token

Para acceder a endpoints protegidos, incluye el token en el header Authorization:

```http
GET /api/usuarios/list
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Endpoints Públicos (No requieren autenticación)

- `/api/auth/login`
- `/api/auth/registro`
- `/login`
- `/registro`
- `/loginclient`
- `/swagger-ui/**`
- Archivos estáticos (HTML, CSS, JS)

## Endpoints Protegidos (Requieren JWT)

- `/api/usuarios/**`
- `/api/habitos/**`
- `/api/categorias/**`
- `/api/frecuencias/**`
- `/api/recordatorios/**`
- `/api/roles/**`

## Configuración

### application.properties
```properties
# JWT Configuration
jwt.secret=RutiniaSecretKeyForJWTAuthenticationAndAuthorizationSpringBootApplication2024
jwt.expiration=86400000  # 24 horas en milisegundos
```

### CORS
El backend está configurado para aceptar peticiones desde:
- `http://localhost:3000` (React)
- `http://localhost:5173` (Vite)
- `http://localhost:8080`

## Integración con Frontend

### Ejemplo en React/JavaScript

```javascript
// Login
const login = async (correo, password) => {
  const response = await fetch('http://localhost:8080/api/auth/login', {
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
    // Guardar token en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({
      id: data.idUsuario,
      nombre: data.nombre,
      correo: data.correo
    }));
  }
  
  return data;
};

// Hacer petición autenticada
const obtenerUsuarios = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/usuarios/list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
};

// Registro
const registro = async (usuario) => {
  const response = await fetch('http://localhost:8080/api/auth/registro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuario)
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({
      id: data.idUsuario,
      nombre: data.nombre,
      correo: data.correo
    }));
  }
  
  return data;
};

// Cerrar sesión
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};
```

## Seguridad

- Las contraseñas se encriptan con **BCrypt** antes de guardarse en la base de datos
- Los tokens JWT tienen una expiración de 24 horas
- Se utiliza una clave secreta fuerte para firmar los tokens
- Los endpoints sensibles están protegidos y requieren autenticación
- CORS está configurado para permitir solo orígenes específicos

## Notas Importantes

1. **Cambiar la clave secreta en producción**: Modifica `jwt.secret` en `application.properties` con una clave más segura y única.

2. **Actualizar contraseñas existentes**: Los usuarios existentes en la base de datos necesitarán tener sus contraseñas encriptadas. Puedes crear un script de migración o pedir a los usuarios que restablezcan sus contraseñas.

3. **Tiempo de expiración**: Ajusta `jwt.expiration` según tus necesidades (actualmente 24 horas).

## Estructura del Proyecto

```
src/main/java/uis/edu/entorno/backend/
├── security/
│   ├── SecurityConfig.java                    # Configuración de Spring Security
│   ├── JwtTokenProvider.java                  # Generación y validación de tokens
│   ├── JwtAuthenticationFilter.java           # Filtro para procesar tokens
│   ├── JwtAuthenticationEntryPoint.java       # Manejo de errores de autenticación
│   └── CustomUserDetailsService.java          # Carga de detalles de usuario
├── controlador/
│   └── AuthControlador.java                   # Endpoints de autenticación
├── modelo/
│   ├── AuthResponseDto.java                   # DTO de respuesta de autenticación
│   └── LoginDto.java                          # DTO de login
└── repositorio/
    └── IUsuarioRepositorio.java               # Repositorio actualizado con findByCorreo
```

## Pruebas

Puedes probar los endpoints usando **Postman**, **cURL** o **Swagger UI**:

### Con cURL:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario":"usuario@correo.com","password":"contraseña"}'

# Obtener usuarios (con token)
curl -X GET http://localhost:8080/api/usuarios/list \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## Solución de Problemas

### Error: "Token inválido"
- Verifica que estés enviando el token en el header Authorization con el formato: `Bearer TOKEN`
- Asegúrate de que el token no haya expirado

### Error: "Credenciales inválidas"
- Verifica que el correo y contraseña sean correctos
- Si tienes usuarios antiguos, asegúrate de que sus contraseñas estén encriptadas con BCrypt

### Error de CORS
- Verifica que tu frontend esté en uno de los orígenes permitidos en `SecurityConfig.java`
- Agrega tu origen si es necesario en el método `corsConfigurationSource()`

## Dependencias Agregadas

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```
