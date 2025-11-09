import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true); // true = login, false = registro
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
    nombre: '',
    apellido: '',
    confirmarContrasena: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    // Validar contraseña
    if (!formData.contrasena) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validaciones adicionales para registro
    if (!isLogin) {
      if (!formData.nombre) {
        newErrors.nombre = 'El nombre es requerido';
      }
      if (!formData.apellido) {
        newErrors.apellido = 'El apellido es requerido';
      }
      if (!formData.confirmarContrasena) {
        newErrors.confirmarContrasena = 'Confirma tu contraseña';
      } else if (formData.contrasena !== formData.confirmarContrasena) {
        newErrors.confirmarContrasena = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Llamada con JWT
      const response = await login(formData.correo, formData.contrasena);

      // Mostrar animación de éxito
      setLoginSuccess(true);
      
      // Esperar un momento antes de notificar al padre
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
      }, 800);

    } catch (error) {
      console.error('Error en login:', error);
      setErrors({ general: error.error || 'Error al iniciar sesión. Verifica tus credenciales.' });
    } finally {
      setLoading(false);
    }
  };

  // Manejar registro
  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await register({
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol_id: 'user'
      });

      // Mostrar animación de éxito
      setLoginSuccess(true);
      
      // Esperar un momento antes de notificar al padre
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(response.user);
        }
      }, 800);

    } catch (error) {
      console.error('Error en registro:', error);
      setErrors({ general: error.error || 'Error al crear la cuenta. El correo ya puede estar registrado.' });
    } finally {
      setLoading(false);
    }
  };

  // Cambiar entre login y registro con animación
  const toggleMode = () => {
    // Iniciar animación de salida
    setIsTransitioning(true);
    
    // Esperar a que termine la animación de salida
    setTimeout(() => {
      setIsLogin(!isLogin);
      setFormData({
        correo: '',
        contrasena: '',
        nombre: '',
        apellido: '',
        confirmarContrasena: ''
      });
      setErrors({});
      setLoginSuccess(false);
      
      // Terminar transición para activar animación de entrada
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md animate-scale-in">
        {/* Botón de volver */}
        <button
          onClick={() => navigate('/bienvenida')}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
        >
          <span className="material-icons group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-medium">Volver al inicio</span>
        </button>

        {/* Título */}
        <div className="text-center mb-6 animate-slide-down">
          <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
            Rutinia
          </h1>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-slide-up">
          {/* Tabs */}
          <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 relative">
            {/* Indicador deslizante */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-white dark:bg-gray-600 rounded-md shadow-sm transition-transform duration-300 ease-out ${
                isLogin ? 'translate-x-1' : 'translate-x-[calc(100%+0.25rem)]'
              }`}
              style={{ zIndex: 0 }}
            />
            
            <button
              onClick={() => !isTransitioning && isLogin === false && toggleMode()}
              disabled={isTransitioning}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 relative ${
                isLogin
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={{ zIndex: 1 }}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => !isTransitioning && isLogin === true && toggleMode()}
              disabled={isTransitioning}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 relative ${
                !isLogin
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
              style={{ zIndex: 1 }}
            >
              Registrarse
            </button>
          </div>

          {/* Error general */}
          {errors.general && (
            <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 animate-shake">
              <span className="material-icons text-red-600 dark:text-red-400 text-sm">error</span>
              <span className="text-red-600 dark:text-red-400 text-sm">{errors.general}</span>
            </div>
          )}

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3">
            {/* Contenedor con animación para los campos */}
            <div 
              key={isLogin ? 'login' : 'register'}
              className={`space-y-3 transition-all duration-300 ease-out ${
                isTransitioning 
                  ? 'opacity-0' 
                  : 'opacity-100'
              }`}
            >
            {/* Campos de registro */}
            {!isLogin && (
              <>
                {/* Nombre */}
                <div className={!isTransitioning ? 'field-animate' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Nombre
                  </label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      person
                    </span>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.nombre && (
                    <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
                  )}
                </div>

                {/* Apellido */}
                <div className={!isTransitioning ? 'field-animate' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Apellido
                  </label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      badge
                    </span>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Tu apellido"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.apellido ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>
                  {errors.apellido && (
                    <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>
                  )}
                </div>
              </>
            )}

            {/* Correo (común para ambos) */}
            <div className={!isTransitioning ? 'field-animate' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  email
                </span>
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.correo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
              </div>
              {errors.correo && (
                <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className={!isTransitioning ? 'field-animate' : ''}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contrasena"
                  value={formData.contrasena}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                    errors.contrasena ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="material-icons text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.contrasena && (
                <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>
              )}
            </div>

            {/* Confirmar contraseña (solo registro) */}
            {!isLogin && (
              <div className={!isTransitioning ? 'field-animate' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    lock_check
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmarContrasena"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                      errors.confirmarContrasena ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-icons text-xl">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.confirmarContrasena && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmarContrasena}</p>
                )}
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading || loginSuccess}
              className={`w-full py-2.5 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 ${
                loginSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50'
              }`}
            >
              {loginSuccess ? (
                <>
                  <span className="material-icons animate-scale-in">check_circle</span>
                  <span>¡Bienvenido!</span>
                </>
              ) : loading ? (
                <>
                  <span className="material-icons animate-spin">refresh</span>
                  <span>Cargando...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                  <span className="material-icons">arrow_forward</span>
                </>
              )}
            </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
          <button
            onClick={toggleMode}
            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
