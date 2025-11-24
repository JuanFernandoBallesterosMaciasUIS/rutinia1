import { useEffect, useState } from 'react';

const NotificationToast = ({ notification, onClose, onMarkAsRead, duration = 8000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 10);

    // Barra de progreso
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        if (newProgress <= 0) {
          clearInterval(interval);
          return 0;
        }
        return newProgress;
      });
    }, 100);

    // Auto-cerrar
    const timeout = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    handleClose();
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

  if (!notification) return null;

  return (
    <div
      className={`fixed top-20 right-4 sm:right-6 z-[9999] max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Barra de progreso */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Contenido */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icono del hábito */}
            <div
              className={`w-12 h-12 ${getIconoColor(
                notification.habito?.color
              )} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}
            >
              <span className="material-icons text-white text-2xl">
                {notification.habito?.icono || 'notifications_active'}
              </span>
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-text-light dark:text-text-dark text-sm mb-1">
                {notification.titulo}
              </h4>
              <p className="text-subtext-light dark:text-subtext-dark text-sm mb-3">
                {notification.mensaje}
              </p>

              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAsRead}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                >
                  <span className="material-icons text-sm">check</span>
                  Entendido
                </button>
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-light dark:text-text-dark rounded-lg text-xs font-medium transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Botón cerrar (X) */}
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
            >
              <span className="material-icons text-gray-400 dark:text-gray-500 text-sm">
                close
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Contenedor para múltiples toasts
export const NotificationToastContainer = ({ notifications, onClose, onMarkAsRead }) => {
  return (
    <div className="fixed top-0 right-0 z-[9999] pointer-events-none">
      <div className="pointer-events-auto space-y-3 p-4">
        {notifications.map((notif, index) => (
          <div
            key={notif.id || index}
            style={{ marginTop: index > 0 ? '12px' : '0' }}
          >
            <NotificationToast
              notification={notif}
              onClose={() => onClose(notif.id || index)}
              onMarkAsRead={onMarkAsRead}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationToast;
