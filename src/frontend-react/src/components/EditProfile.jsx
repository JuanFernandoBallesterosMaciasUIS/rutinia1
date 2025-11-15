import { useState, useEffect } from 'react';
import { updateUsuario } from '../services/api';

const EditProfile = ({ isOpen, onClose, usuario, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    claveActual: '',
    claveNueva: '',
    confirmarClaveNueva: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && usuario) {
      console.log('📋 Datos del usuario en EditProfile:', usuario);
      console.log('🔑 ID del usuario:', usuario._id || usuario.id);
      
      setFormData({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        correo: usuario.correo || '',
        claveActual: '',
        claveNueva: '',
        confirmarClaveNueva: ''
      });
      setChangePassword(false);
      setErrors({});
      setIsClosing(false); // Reset closing state
    }
  }, [isOpen, usuario]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo
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

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    // Validar correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.correo) {
      newErrors.correo = 'El correo es requerido';
    } else if (!emailRegex.test(formData.correo)) {
      newErrors.correo = 'Correo inválido';
    }

    // Validaciones de contraseña (solo si quiere cambiarla)
    if (changePassword) {
      if (!formData.claveActual) {
        newErrors.claveActual = 'Ingresa tu contraseña actual';
      }
      if (!formData.claveNueva) {
        newErrors.claveNueva = 'Ingresa una nueva contraseña';
      } else if (formData.claveNueva.length < 6) {
        newErrors.claveNueva = 'Mínimo 6 caracteres';
      }
      if (!formData.confirmarClaveNueva) {
        newErrors.confirmarClaveNueva = 'Confirma la nueva contraseña';
      } else if (formData.claveNueva !== formData.confirmarClaveNueva) {
        newErrors.confirmarClaveNueva = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Obtener el ID del usuario (puede ser _id, id, o $oid)
      let userId = usuario.id || usuario._id;
      
      // Si el ID es un objeto con $oid (formato MongoDB), extraer el valor
      if (userId && typeof userId === 'object' && userId.$oid) {
        userId = userId.$oid;
      }
      
      console.log('🔑 Intentando actualizar usuario con ID:', userId);
      console.log('📦 Objeto usuario completo:', usuario);
      
      if (!userId) {
        console.error('❌ No se encontró ID del usuario');
        setErrors({ general: 'No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.' });
        setLoading(false);
        return;
      }

      // Preparar datos a actualizar
      const updateData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        tema: usuario.tema || 'light'
      };

      // Si quiere cambiar contraseña, validar y agregar
      if (changePassword) {
        // Verificar contraseña actual
        if (formData.claveActual !== usuario.clave) {
          setErrors({ claveActual: 'Contraseña actual incorrecta' });
          setLoading(false);
          return;
        }
        updateData.clave = formData.claveNueva;
      } else {
        // Mantener la contraseña actual
        updateData.clave = usuario.clave;
      }

      console.log('📤 Enviando datos de actualización:', updateData);

      // Actualizar usuario
      const usuarioActualizado = await updateUsuario(userId, updateData);
      
      // Actualizar localStorage
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      
      // Notificar éxito
      if (onUpdateSuccess) {
        onUpdateSuccess(usuarioActualizado);
      }
      
      // Cerrar modal con animación
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 250);
      
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setErrors({ general: error.message || 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal con animación
  const handleClose = () => {
    if (!loading) {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        setIsClosing(false);
      }, 250); // Duración de la animación de salida
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 modal-backdrop ${
        isClosing ? 'modal-overlay-exit' : 'modal-overlay-enter'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${
          isClosing ? 'modal-content-exit' : 'modal-content-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between modal-header-enter">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="material-icons text-purple-600 dark:text-purple-400">edit</span>
            Editar Perfil
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 modal-body-enter">
          {/* Error general */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <span className="material-icons text-red-600 dark:text-red-400 text-sm">error</span>
              <span className="text-red-600 dark:text-red-400 text-sm">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
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
            <div>
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

            {/* Correo */}
            <div>
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

            {/* Divisor */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
            </div>

            {/* Checkbox para cambiar contraseña */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="changePassword"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="changePassword" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Cambiar contraseña
              </label>
            </div>

            {/* Campos de contraseña (solo si changePassword está activo) */}
            {changePassword && (
              <>
                {/* Contraseña actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      lock
                    </span>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="claveActual"
                      value={formData.claveActual}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.claveActual ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <span className="material-icons text-xl">
                        {showCurrentPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.claveActual && (
                    <p className="text-red-500 text-xs mt-1">{errors.claveActual}</p>
                  )}
                </div>

                {/* Nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      lock_reset
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="claveNueva"
                      value={formData.claveNueva}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.claveNueva ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <span className="material-icons text-xl">
                        {showNewPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {errors.claveNueva && (
                    <p className="text-red-500 text-xs mt-1">{errors.claveNueva}</p>
                  )}
                </div>

                {/* Confirmar nueva contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      lock_outline
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmarClaveNueva"
                      value={formData.confirmarClaveNueva}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 ${
                        errors.confirmarClaveNueva ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
                  {errors.confirmarClaveNueva && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmarClaveNueva}</p>
                  )}
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex gap-2 pt-4 modal-footer-enter">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2 px-3 text-sm rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <span className="material-icons animate-spin text-sm">refresh</span>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-sm">check</span>
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
