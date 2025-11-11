import { useState } from 'react';

function Sidebar({ isOpen, onClose, darkMode, onToggleDarkMode, onLogout, usuario, onEditProfile, onViewChange }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Función para manejar logout con animación
  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      onLogout();
    }, 300);
  };

  // Función para obtener las iniciales del usuario
  const getInitials = () => {
    if (!usuario) return 'U';
    
    const nombre = usuario.nombre || '';
    const apellido = usuario.apellido || '';
    
    // Obtener la primera letra del nombre y apellido
    const inicialNombre = nombre.charAt(0).toUpperCase();
    const inicialApellido = apellido.charAt(0).toUpperCase();
    
    // Si tiene ambos, retornar ambas iniciales
    if (inicialNombre && inicialApellido) {
      return inicialNombre + inicialApellido;
    }
    
    // Si solo tiene nombre, retornar las dos primeras letras del nombre
    if (inicialNombre && nombre.length > 1) {
      return inicialNombre + nombre.charAt(1).toUpperCase();
    }
    
    // En caso contrario, retornar lo que se tenga
    return inicialNombre || inicialApellido || 'U';
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-full w-64 bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col shadow-xl overflow-y-auto`}
    >
      <div className="flex flex-col p-6">
        <div className="flex flex-col items-center mb-6 px-2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4 flex items-center justify-center overflow-hidden shadow-lg">
            <span className="text-white text-4xl font-bold">
              {getInitials()}
            </span>
          </div>
          <h2 className="font-bold text-base text-center leading-tight mb-1 text-text-light dark:text-text-dark">
            {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario'}
          </h2>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 break-all px-1">
            {usuario?.correo || 'correo@ejemplo.com'}
          </p>
        </div>
        
        <nav className="flex flex-col space-y-2">
          <button 
            className="flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={onToggleDarkMode}
          >
            <span className="material-icons mr-4">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            <span>Modo {darkMode ? 'Claro' : 'Oscuro'}</span>
          </button>
          <button 
            className="flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left" 
            onClick={onEditProfile}
          >
            <span className="material-icons mr-4">edit</span>
            <span>Editar perfil</span>
          </button>
          <button 
            className="flex items-center p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative text-left" 
            onClick={() => {
              if (onViewChange) {
                onViewChange('notifications');
              }
              if (onClose) {
                onClose();
              }
            }}
          >
            <span className="material-icons mr-4">notifications</span>
            <span>Notificaciones</span>
          </button>
          
          {/* Separador */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700"></div>
          
          {/* Botón de cerrar sesión */}
          <button 
            className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
              isLoggingOut 
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 scale-95' 
                : 'hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
            }`}
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <span className={`material-icons mr-4 ${isLoggingOut ? 'animate-spin' : ''}`}>
              {isLoggingOut ? 'sync' : 'logout'}
            </span>
            <span>{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;
