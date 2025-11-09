# 👥 Guía de Gestión de Usuarios - Rutinia

## 📋 Descripción General

El sistema de gestión de usuarios permite a los administradores crear, editar y eliminar usuarios de la aplicación Rutinia. Esta funcionalidad está **restringida únicamente a usuarios con rol de "Administrador"**.

## 🔐 Control de Acceso

### Verificación de Rol
- Solo usuarios con rol `administrador` pueden acceder a `/usuarios.html`
- El botón "👥 Usuarios (Admin)" solo aparece para administradores en las páginas de Hábitos y Categorías
- Acceso directo a la URL redirige a usuarios no autorizados

### Flujo de Autenticación
1. Usuario inicia sesión en `login.html`
2. Sistema obtiene token JWT
3. Se consulta información del usuario incluyendo su rol
4. Rol se almacena en `localStorage` como `userRole`
5. Interfaz muestra/oculta opciones según el rol

## 🎯 Funcionalidades

### 1. Listado de Usuarios
- **Tabla completa** con todos los usuarios del sistema
- **Columnas mostradas:**
  - ID del usuario
  - Nombre completo (nombre + apellido)
  - Correo electrónico
  - Rol (con badge visual)
  - Tema preferido (claro/oscuro/automático)
  - Estado de notificaciones (✅/❌)
  - Acciones (Editar/Eliminar)

### 2. Búsqueda de Usuarios
- **Búsqueda en tiempo real** por:
  - Nombre
  - Apellido
  - Correo electrónico
  - Nombre del rol
- Filtrado automático al escribir

### 3. Estadísticas
- **Total de Usuarios:** Contador general
- **Total de Administradores:** Usuarios con rol admin

### 4. Crear Nuevo Usuario

#### Formulario de Creación
```javascript
{
  nombre: "Juan",           // Requerido, máx 50 caracteres
  apellido: "Pérez",        // Requerido, máx 50 caracteres
  correo: "juan@email.com", // Requerido, único, formato email
  clave: "contraseña123",   // Requerido, mín 6 caracteres
  rol: { idRol: 1 },        // Requerido, ID del rol
  tema: "claro",            // Requerido: claro/oscuro/automatico
  notificaciones: true      // Boolean, por defecto true
}
```

#### Validaciones
- **Correo:** Debe ser único en el sistema
- **Contraseña:** Mínimo 6 caracteres
- **Rol:** Debe seleccionarse de la lista disponible
- **Tema:** Debe ser uno de los valores permitidos

### 5. Editar Usuario

#### Diferencias con Creación
- El campo **contraseña es opcional** al editar
- Si no se proporciona nueva contraseña, mantiene la anterior (encriptada)
- Otros campos pueden actualizarse libremente

#### Endpoint Usado
```
PUT /api/usuarios/
Content-Type: application/json
Authorization: Bearer {token}

{
  "idUsuario": 5,
  "nombre": "Juan Actualizado",
  "apellido": "Pérez",
  "correo": "juan.nuevo@email.com",
  "clave": "encriptada_original", // Si no se cambia
  "rol": { "idRol": 2 },
  "tema": "oscuro",
  "notificaciones": false
}
```

### 6. Eliminar Usuario

#### Confirmación
- Muestra diálogo de confirmación con nombre del usuario
- Advierte que la acción no se puede deshacer

#### Endpoint Usado
```
DELETE /api/usuarios/{id}
Authorization: Bearer {token}
```

## 🎨 Interfaz de Usuario

### Diseño Visual
- **Tema:** Gradiente púrpura consistente con la app
- **Badge de Administrador:** Identificación visual del panel
- **Badges de Rol:**
  - 🎨 Rosa (administrador)
  - 🔵 Azul (usuario regular)
- **Estado activo:** Badge verde con ID del usuario

### Navegación
```
Header
├── Título: "👥 Rutinia - Gestión de Usuarios"
├── Badge: "🔐 Panel de Administrador"
├── Botón: "← Volver a Hábitos"
├── Usuario actual
└── Botón: "Cerrar Sesión"
```

## 🔧 Implementación Técnica

### Archivos Modificados

#### 1. `src/main/resources/static/usuarios.html` (NUEVO)
- Vista completa de gestión de usuarios
- Control de acceso por rol
- CRUD completo con validaciones
- Interfaz responsive

#### 2. `src/main/resources/static/login.html`
```javascript
// Se agregó función para obtener rol después del login
async function obtenerRolUsuario(usuarioId, token) {
    const response = await fetch(`/api/usuarios/list/${usuarioId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const usuario = await response.json();
    
    localStorage.setItem('userRole', usuario.rol.nombre);
    localStorage.setItem('userRoleId', usuario.rol.idRol);
}
```

#### 3. `src/main/resources/static/habitos.html`
```javascript
// Mostrar botón admin solo para administradores
const userRole = localStorage.getItem('userRole');
if (userRole && userRole.toLowerCase() === 'administrador') {
    document.getElementById('btnAdminPanel').style.display = 'inline-block';
}
```

#### 4. `src/main/resources/static/categorias.html`
- Misma lógica de control de acceso que habitos.html

### Endpoints del Backend Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios/list` | Obtiene todos los usuarios |
| GET | `/api/usuarios/list/{id}` | Obtiene un usuario específico |
| POST | `/api/usuarios/` | Crea un nuevo usuario |
| PUT | `/api/usuarios/` | Actualiza un usuario existente |
| DELETE | `/api/usuarios/{id}` | Elimina un usuario |
| GET | `/api/roles/list` | Obtiene todos los roles disponibles |

## 🧪 Pruebas

### 1. Verificar Control de Acceso
```bash
# Como usuario regular:
1. Iniciar sesión con usuario no-admin
2. Ir a habitos.html
3. Verificar que NO aparece botón "👥 Usuarios (Admin)"
4. Intentar acceder a /usuarios.html directamente
5. Debe redirigir a habitos.html con mensaje de error

# Como administrador:
1. Iniciar sesión con usuario admin
2. Ir a habitos.html
3. Verificar que SÍ aparece botón "👥 Usuarios (Admin)"
4. Clic en botón debe llevar a usuarios.html
```

### 2. Crear Usuario
```bash
1. Clic en "Nuevo Usuario"
2. Completar formulario:
   - Nombre: Test
   - Apellido: Usuario
   - Correo: test@test.com
   - Contraseña: 123456
   - Rol: usuario
   - Tema: claro
   - Notificaciones: ✅
3. Clic en "Guardar"
4. Verificar mensaje de éxito
5. Verificar usuario en tabla
```

### 3. Editar Usuario
```bash
1. Clic en botón ✏️ de un usuario
2. Modificar nombre a "Test Editado"
3. Dejar contraseña vacía (no cambiar)
4. Cambiar tema a "oscuro"
5. Clic en "Guardar"
6. Verificar cambios en tabla
```

### 4. Eliminar Usuario
```bash
1. Clic en botón 🗑️ de un usuario
2. Confirmar eliminación en diálogo
3. Verificar mensaje de éxito
4. Verificar que usuario desapareció de tabla
5. Verificar actualización de estadísticas
```

### 5. Búsqueda
```bash
1. Escribir "admin" en búsqueda
2. Verificar filtrado a usuarios con rol admin
3. Escribir correo específico
4. Verificar filtrado correcto
5. Borrar búsqueda
6. Verificar que muestra todos los usuarios
```

## 📊 Datos en LocalStorage

```javascript
// Después de login exitoso:
localStorage.getItem('token')       // JWT token
localStorage.getItem('userId')      // ID del usuario actual
localStorage.getItem('userName')    // Nombre del usuario
localStorage.getItem('userEmail')   // Email del usuario
localStorage.getItem('userRole')    // Nombre del rol (ej: "administrador")
localStorage.getItem('userRoleId')  // ID del rol (ej: 1)
```

## 🔒 Seguridad

### Frontend
- Verificación de rol antes de mostrar UI de admin
- Redirección automática si no es administrador
- Validación de formularios antes de envío

### Backend
- Todos los endpoints protegidos con JWT
- Spring Security valida token en cada petición
- Contraseñas encriptadas con BCrypt
- Validaciones de negocio en controladores

## 🎯 Casos de Uso

### Administrador Crea Nuevo Admin
```javascript
// El nuevo admin podrá:
1. Acceder a usuarios.html
2. Ver botón "👥 Usuarios (Admin)" en navegación
3. Gestionar otros usuarios
4. Crear/editar/eliminar usuarios y categorías
```

### Administrador Cambia Rol de Usuario
```javascript
// Escenario: Admin cambia usuario regular a admin
1. Editar usuario
2. Cambiar rol de "usuario" a "administrador"
3. Guardar cambios
4. Usuario debe cerrar sesión y volver a iniciar
5. Ahora verá opciones de administrador
```

### Cambio de Contraseña
```javascript
// Al editar usuario:
1. Dejar campo contraseña vacío = NO cambia
2. Escribir nueva contraseña = SE actualiza encriptada
```

## 🚀 Próximas Mejoras Sugeridas

1. **Cambio de Contraseña Separado:**
   - Modal específico para cambiar contraseña
   - Requiere contraseña actual para confirmar

2. **Desactivar Usuario (Soft Delete):**
   - Agregar campo `activo` al modelo
   - Permitir desactivar sin eliminar

3. **Logs de Actividad:**
   - Registrar quién creó/editó/eliminó usuarios
   - Fecha y hora de cambios

4. **Paginación:**
   - Cuando haya muchos usuarios
   - Mostrar N usuarios por página

5. **Exportar Usuarios:**
   - Botón para descargar lista en CSV/Excel

6. **Filtros Avanzados:**
   - Por rol
   - Por tema preferido
   - Por estado de notificaciones

## 📝 Notas Importantes

⚠️ **ADVERTENCIAS:**
- No eliminar el último usuario administrador
- Las contraseñas se encriptan automáticamente
- Los correos deben ser únicos en el sistema
- Al eliminar usuario se pierden todos sus hábitos asociados

✅ **BUENAS PRÁCTICAS:**
- Siempre usar contraseñas seguras
- Verificar correo antes de crear usuario
- Mantener al menos 2 administradores activos
- No compartir credenciales de admin

## 🆘 Solución de Problemas

### "Acceso Denegado" al entrar a usuarios.html
**Causa:** Usuario no tiene rol de administrador  
**Solución:** Iniciar sesión con usuario admin

### Botón "Usuarios" no aparece
**Causa:** LocalStorage no tiene `userRole` guardado  
**Solución:** Cerrar sesión y volver a iniciar sesión

### Error al crear usuario: "Correo ya existe"
**Causa:** Correo duplicado en base de datos  
**Solución:** Usar otro correo electrónico

### Usuario editado pero contraseña no funciona
**Causa:** Si dejas vacío el campo, mantiene la anterior  
**Solución:** Escribir nueva contraseña explícitamente

---

**Versión:** 1.0  
**Fecha:** 2024  
**Proyecto:** Rutinia - Sistema de Gestión de Hábitos
