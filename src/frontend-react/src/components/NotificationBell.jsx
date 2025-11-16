import { useState, useEffect, useRef } from 'react';
import {
  getNotificacionesNoLeidas,
  marcarNotificacionLeida,
  formatearFechaNotificacion
} from '../services/notificationService';

const NotificationBell = ({ usuario }) => {
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (usuario?.id || usuario?._id) {
      cargarNotificacionesNoLeidas();
      
      // Actualizar cada minuto
      const interval = setInterval(cargarNotificacionesNoLeidas, 60000);
      return () => clearInterval(interval);
    }
  }, [usuario]);

  useEffect(() => {
    // Cerrar dropdown al hacer click fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarNotificacionesNoLeidas = async () => {
    if (!usuario?.id && !usuario?._id) return;

    try {
      const userId = usuario.id || usuario._id;
      const data = await getNotificacionesNoLeidas(userId);
      setNotificacionesNoLeidas(data);
    } catch (error) {
      console.error('Error al cargar notificaciones no leídas:', error);
    }
  };

  const handleMarcarLeida = async (notifId, e) => {
    e.stopPropagation();
    
    try {
      await marcarNotificacionLeida(notifId);
      setNotificacionesNoLeidas(prev => prev.filter(n => n.id !== notifId));
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const handleVerTodas = () => {
    setShowDropdown(false);
    // En lugar de navegar, disparar un evento para cambiar la vista
    window.dispatchEvent(new CustomEvent('changeView', { detail: { view: 'notifications' } }));
  };

  const getIconoColor = (color) => {
    const colorMap = {
      indigo: 'bg-indigo-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500'
    };
    return colorMap[color] || 'bg-blue-500';
  };

  const count = notificacionesNoLeidas.length;
  const recentNotifications = notificacionesNoLeidas.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón campanita */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        aria-label="Notificaciones"
      >
        <span className="material-icons text-text-light dark:text-text-dark">
          {count > 0 ? 'notifications_active' : 'notifications'}
        </span>
        
        {/* Badge con contador */}
        {count > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Header del dropdown */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-light dark:text-text-dark">
                Notificaciones
              </h3>
              {count > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {count}
                </span>
              )}
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-icons text-4xl text-gray-300 dark:text-gray-600 mb-2">
                  notifications_none
                </span>
                <p className="text-subtext-light dark:text-subtext-dark text-sm">
                  No tienes notificaciones nuevas
                </p>
              </div>
            ) : (
              recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 transition-all cursor-pointer"
                  onClick={() => handleVerTodas()}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono pequeño */}
                    <div
                      className={`w-10 h-10 ${getIconoColor(
                        notif.habito?.color
                      )} rounded-lg flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="material-icons text-white text-lg">
                        {notif.habito?.icono || 'notifications'}
                      </span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-light dark:text-text-dark text-sm mb-1">
                        {notif.titulo}
                      </p>
                      <p className="text-subtext-light dark:text-subtext-dark text-xs mb-1 line-clamp-2">
                        {notif.mensaje}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatearFechaNotificacion(notif.fecha_hora)}
                      </p>
                    </div>

                    {/* Botón marcar leída */}
                    <button
                      onClick={(e) => handleMarcarLeida(notif.id, e)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex-shrink-0"
                      title="Marcar como leída"
                    >
                      <span className="material-icons text-gray-500 dark:text-gray-400 text-sm">
                        check
                      </span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con botón "Ver todas" */}
          {count > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={handleVerTodas}
                className="w-full py-2 text-primary hover:text-primary-dark font-medium text-sm transition-all"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
