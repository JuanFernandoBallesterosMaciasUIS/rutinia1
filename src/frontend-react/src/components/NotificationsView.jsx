import { useState, useEffect } from 'react';
import {
  getNotificaciones,
  getNotificacionesNoLeidas,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  formatearFechaNotificacion
} from '../services/notificationService';

const NotificationsView = ({ usuario }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'no_leidas'

  useEffect(() => {
    cargarNotificaciones();
  }, [filtro, usuario]);

  const cargarNotificaciones = async () => {
    if (!usuario?.id && !usuario?._id) return;

    setLoading(true);
    try {
      const userId = usuario.id || usuario._id;
      
      let data;
      if (filtro === 'no_leidas') {
        data = await getNotificacionesNoLeidas(userId);
      } else {
        data = await getNotificaciones(userId);
      }
      
      setNotificaciones(data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarLeida = async (notificacionId) => {
    try {
      await marcarNotificacionLeida(notificacionId);
      // Actualizar la notificación localmente
      setNotificaciones(prev =>
        prev.map(notif =>
          notif.id === notificacionId
            ? { ...notif, leida: true, fecha_lectura: new Date().toISOString() }
            : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificación:', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const userId = usuario.id || usuario._id;
      await marcarTodasLeidas(userId);
      await cargarNotificaciones();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
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

  const notificacionesNoLeidas = notificaciones.filter(n => !n.leida).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Filtros y acciones */}
      <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filtro === 'todas'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltro('no_leidas')}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm flex items-center gap-2 ${
                filtro === 'no_leidas'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              No leídas
              {notificacionesNoLeidas > 0 && (
                <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>
          </div>

          {/* Marcar todas como leídas */}
          {notificacionesNoLeidas > 0 && (
            <button
              onClick={handleMarcarTodasLeidas}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-all text-sm flex items-center gap-2"
            >
              <span className="material-icons text-lg">done_all</span>
              Marcar todas leídas
            </button>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      {notificaciones.length === 0 ? (
        <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-sm p-12 text-center">
          <span className="material-icons text-6xl text-gray-300 dark:text-gray-600 mb-4">
            notifications_none
          </span>
          <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
            No hay notificaciones
          </h3>
          <p className="text-subtext-light dark:text-subtext-dark">
            {filtro === 'no_leidas'
              ? 'No tienes notificaciones sin leer'
              : 'Aquí aparecerán los recordatorios de tus hábitos'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((notif) => (
            <div
              key={notif.id}
              className={`bg-card-light dark:bg-card-dark rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                !notif.leida ? 'border-l-4 border-primary' : ''
              }`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Icono del hábito */}
                  <div
                    className={`w-12 h-12 ${getIconoColor(
                      notif.habito?.color
                    )} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <span className="material-icons text-white text-2xl">
                      {notif.habito?.icono || 'notifications'}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3
                        className={`font-semibold text-text-light dark:text-text-dark ${
                          !notif.leida ? 'font-bold' : ''
                        }`}
                      >
                        {notif.titulo}
                      </h3>
                      {!notif.leida && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
                      )}
                    </div>
                    <p className="text-subtext-light dark:text-subtext-dark text-sm mb-2">
                      {notif.mensaje}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="material-icons text-sm">schedule</span>
                      <span>{formatearFechaNotificacion(notif.fecha_hora)}</span>
                    </div>
                  </div>

                  {/* Botón marcar como leída */}
                  {!notif.leida && (
                    <button
                      onClick={() => handleMarcarLeida(notif.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex-shrink-0"
                      title="Marcar como leída"
                    >
                      <span className="material-icons text-gray-500 dark:text-gray-400">
                        done
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
