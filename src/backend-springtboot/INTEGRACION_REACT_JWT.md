# Integración JWT en Frontend React - Rutinia

## Configuración de Servicios de Autenticación

### 1. Crear `src/services/authService.js`

```javascript
const API_URL = 'http://localhost:8080/api/auth';

// Servicio de autenticación
const authService = {
  // Login
  login: async (correo, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
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
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify({
          id: data.idUsuario,
          nombre: data.nombre,
          correo: data.correo
        }));
        return { success: true, data };
      } else {
        return { success: false, error: data.mensaje || 'Error en login' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Registro
  registro: async (datosUsuario) => {
    try {
      const response = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosUsuario)
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token y datos del usuario
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify({
          id: data.idUsuario,
          nombre: data.nombre,
          correo: data.correo
        }));
        return { success: true, data };
      } else {
        return { success: false, error: data.mensaje || 'Error en registro' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Validar token
  validarToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/validar`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      return data.valido || false;
    } catch (error) {
      return false;
    }
  }
};

export default authService;
```

### 2. Crear un Hook personalizado `src/hooks/useAuth.js`

```javascript
import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación al cargar
    const verificarAuth = async () => {
      const token = authService.getToken();
      if (token) {
        const valido = await authService.validarToken();
        if (valido) {
          setUsuario(authService.getCurrentUser());
          setIsAuthenticated(true);
        } else {
          authService.logout();
        }
      }
      setLoading(false);
    };

    verificarAuth();
  }, []);

  const login = async (correo, password) => {
    const result = await authService.login(correo, password);
    if (result.success) {
      setUsuario(authService.getCurrentUser());
      setIsAuthenticated(true);
    }
    return result;
  };

  const registro = async (datosUsuario) => {
    const result = await authService.registro(datosUsuario);
    if (result.success) {
      setUsuario(authService.getCurrentUser());
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUsuario(null);
    setIsAuthenticated(false);
  };

  return {
    usuario,
    isAuthenticated,
    loading,
    login,
    registro,
    logout
  };
};
```

### 3. Crear interceptor para peticiones autenticadas `src/services/api.js`

```javascript
const BASE_URL = 'http://localhost:8080/api';

// Función helper para hacer peticiones con token
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, config);
    
    // Si el token es inválido, limpiar localStorage y redirigir
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error en la petición');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// API de usuarios
export const usuariosAPI = {
  getAll: () => fetchWithAuth('/usuarios/list'),
  
  getById: (id) => fetchWithAuth(`/usuarios/list/${id}`),
  
  create: (usuario) => fetchWithAuth('/usuarios/', {
    method: 'POST',
    body: JSON.stringify(usuario)
  }),
  
  update: (usuario) => fetchWithAuth('/usuarios/', {
    method: 'PUT',
    body: JSON.stringify(usuario)
  }),
  
  delete: (id) => fetchWithAuth(`/usuarios/${id}`, {
    method: 'DELETE'
  })
};

// API de hábitos
export const habitosAPI = {
  getAll: () => fetchWithAuth('/habitos/list'),
  
  getById: (id) => fetchWithAuth(`/habitos/${id}`),
  
  getByUsuario: (idUsuario) => fetchWithAuth(`/habitos/usuario/${idUsuario}`),
  
  create: (habito) => fetchWithAuth('/habitos/', {
    method: 'POST',
    body: JSON.stringify(habito)
  }),
  
  update: (habito) => fetchWithAuth('/habitos/', {
    method: 'PUT',
    body: JSON.stringify(habito)
  }),
  
  delete: (id) => fetchWithAuth(`/habitos/${id}`, {
    method: 'DELETE'
  })
};

// Exportar función genérica
export default fetchWithAuth;
```

### 4. Componente de Login `src/components/Login.jsx`

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(correo, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            placeholder="correo@ejemplo.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
};

export default Login;
```

### 5. Componente de Registro `src/components/Registro.jsx`

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    clave: '',
    confirmarClave: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.clave !== formData.confirmarClave) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const usuario = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        clave: formData.clave,
        rol: { idRol: 1 }, // Rol por defecto
        tema: 'light',
        notificaciones: true
      };

      const result = await registro(usuario);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-container">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            type="text"
            id="apellido"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="correo">Correo electrónico</label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="clave">Contraseña</label>
          <input
            type="password"
            id="clave"
            name="clave"
            value={formData.clave}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmarClave">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmarClave"
            name="confirmarClave"
            value={formData.confirmarClave}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>
    </div>
  );
};

export default Registro;
```

### 6. Componente de Ruta Protegida `src/components/ProtectedRoute.jsx`

```jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

### 7. Configuración de Rutas en `App.jsx`

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Registro from './components/Registro';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 8. Ejemplo de uso en componente `src/components/Dashboard.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { habitosAPI } from '../services/api';

const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const [habitos, setHabitos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHabitos();
  }, []);

  const cargarHabitos = async () => {
    try {
      setLoading(true);
      const data = await habitosAPI.getByUsuario(usuario.id);
      setHabitos(data);
    } catch (error) {
      console.error('Error al cargar hábitos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Bienvenido, {usuario?.nombre}!</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </header>

      <main>
        <h2>Mis Hábitos</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="habitos-list">
            {habitos.map(habito => (
              <div key={habito.idHabito} className="habito-card">
                <h3>{habito.nombre}</h3>
                <p>{habito.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
```

## Estructura de Archivos Recomendada

```
src/
├── components/
│   ├── Login.jsx
│   ├── Registro.jsx
│   ├── Dashboard.jsx
│   └── ProtectedRoute.jsx
├── hooks/
│   └── useAuth.js
├── services/
│   ├── authService.js
│   └── api.js
├── App.jsx
└── main.jsx
```

## Instalación de Dependencias

```bash
npm install react-router-dom
```

## Notas Importantes

1. **Token Storage:** Los tokens se guardan en localStorage. Para mayor seguridad en producción, considera usar httpOnly cookies.

2. **Refresh Tokens:** En producción, implementa refresh tokens para renovar tokens expirados sin pedir credenciales nuevamente.

3. **Error Handling:** Maneja apropiadamente los errores 401 y redirige al login cuando sea necesario.

4. **HTTPS:** En producción, siempre usa HTTPS para transmitir tokens de forma segura.

5. **Validación:** El token se valida automáticamente al cargar la aplicación con el hook `useAuth`.

## Mejoras Futuras

- [ ] Implementar refresh tokens
- [ ] Agregar loading states globales
- [ ] Implementar toast notifications para errores
- [ ] Agregar remember me functionality
- [ ] Implementar 2FA (autenticación de dos factores)
- [ ] Mejorar manejo de errores con contexto global
