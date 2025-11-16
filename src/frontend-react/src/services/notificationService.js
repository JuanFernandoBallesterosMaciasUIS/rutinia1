import { apiClient } from './authService';

/**
 * Servicio para gestionar notificaciones de hábitos
 */

// Sonido de notificación (puedes reemplazar con un archivo de audio real)
export const playNotificationSound = () => {
  try {
    // Crear un AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar el sonido (tono agradable)
    oscillator.frequency.value = 800; // Frecuencia en Hz
    oscillator.type = 'sine'; // Tipo de onda

    // Volumen
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Reproducir
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Error al reproducir sonido:', error);
  }
};

/**
 * Obtener todas las notificaciones de un usuario
 */
export const getNotificaciones = async (usuarioId) => {
  try {
    const response = await apiClient.get(`/notificaciones/?usuario=${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    throw error;
  }
};

/**
 * Obtener notificaciones no leídas
 */
export const getNotificacionesNoLeidas = async (usuarioId) => {
  try {
    const response = await apiClient.get(`/notificaciones/no_leidas/?usuario=${usuarioId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    throw error;
  }
};

/**
 * Marcar una notificación como leída
 */
export const marcarNotificacionLeida = async (notificacionId) => {
  try {
    const response = await apiClient.post(`/notificaciones/${notificacionId}/marcar_leida/`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    throw error;
  }
};

/**
 * Marcar todas las notificaciones como leídas
 */
export const marcarTodasLeidas = async (usuarioId) => {
  try {
    const response = await apiClient.post('/notificaciones/marcar_todas_leidas/', {
      usuario: usuarioId
    });
    return response.data;
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    throw error;
  }
};

/**
 * Crear una nueva notificación
 */
export const crearNotificacion = async (data) => {
  try {
    const response = await apiClient.post('/notificaciones/crear_notificacion/', data);
    return response.data;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

// Cache para evitar notificaciones duplicadas
const notificacionesEnviadas = new Map();

/**
 * Verificar si hay notificaciones pendientes para hábitos del día
 * y mostrarlas si es la hora configurada
 */
export const verificarNotificacionesHabitos = (habitos, onNotificacion) => {
  const ahora = new Date();
  const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  
  console.log(`🔍 Verificando notificaciones a las ${horaActual}`);
  console.log(`📋 Total de hábitos a verificar: ${habitos.length}`);
  
  habitos.forEach(habito => {
    console.log(`🔎 Revisando hábito: ${habito.name}`);
    console.log(`   - Tiene notificaciones:`, habito.notificaciones);
    
    if (habito.notificaciones && habito.notificaciones.length > 0) {
      habito.notificaciones.forEach(notif => {
        console.log(`   - Notificación: ${notif.hora}, Activa: ${notif.activa}`);
        
        if (notif.activa && notif.hora === horaActual) {
          // Crear clave única para esta notificación
          const cacheKey = `${habito.id}-${notif.hora}`;
          const ultimoEnvio = notificacionesEnviadas.get(cacheKey);
          
          // Solo enviar si no se ha enviado en los últimos 59 segundos
          if (!ultimoEnvio || (minutosActuales > ultimoEnvio)) {
            console.log(`✅ ¡NOTIFICACIÓN ACTIVADA! Hábito: ${habito.name} a las ${notif.hora}`);
            notificacionesEnviadas.set(cacheKey, minutosActuales);
            mostrarNotificacion(habito, onNotificacion);
          } else {
            console.log(`⏭️ Notificación ya enviada este minuto`);
          }
        }
      });
    } else {
      console.log(`   ⚠️ No tiene notificaciones configuradas`);
    }
  });
  
  // Limpiar cache de notificaciones antiguas (más de 2 horas)
  const doHorasAtras = minutosActuales - 120;
  for (const [key, minutos] of notificacionesEnviadas.entries()) {
    if (minutos < doHorasAtras) {
      notificacionesEnviadas.delete(key);
    }
  }
};

/**
 * Mostrar notificación visual y reproducir sonido
 */
export const mostrarNotificacion = (habito, onNotificacion) => {
  console.log('🔔 MOSTRANDO NOTIFICACIÓN para:', habito.name);
  
  // Reproducir sonido
  try {
    playNotificationSound();
    console.log('🔊 Sonido reproducido');
  } catch (error) {
    console.error('❌ Error al reproducir sonido:', error);
  }
  
  // Mostrar notificación del navegador si está permitido
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`⏰ Recordatorio: ${habito.name}`, {
        body: `Es hora de completar tu hábito: ${habito.name}`,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: habito.id,
        requireInteraction: false,
        silent: false
      });
      console.log('📱 Notificación del navegador mostrada');
    } catch (error) {
      console.error('❌ Error al mostrar notificación del navegador:', error);
    }
  } else {
    console.log('⚠️ Notificaciones del navegador no permitidas. Estado:', Notification?.permission);
  }
  
  // Callback para mostrar notificación en la app
  if (onNotificacion) {
    try {
      onNotificacion(habito);
      console.log('💬 Toast in-app activado');
    } catch (error) {
      console.error('❌ Error al mostrar toast:', error);
    }
  }
};

/**
 * Solicitar permiso para mostrar notificaciones del navegador
 */
export const solicitarPermisoNotificaciones = async () => {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }
  return false;
};

/**
 * Formatear fecha de notificación
 */
export const formatearFechaNotificacion = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const ahora = new Date();
  const diff = ahora - fecha;
  
  // Menos de 1 minuto
  if (diff < 60000) {
    return 'Hace un momento';
  }
  
  // Menos de 1 hora
  if (diff < 3600000) {
    const minutos = Math.floor(diff / 60000);
    return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  }
  
  // Menos de 1 día
  if (diff < 86400000) {
    const horas = Math.floor(diff / 3600000);
    return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  }
  
  // Más de 1 día
  const dias = Math.floor(diff / 86400000);
  if (dias < 7) {
    return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  }
  
  // Formato completo
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: fecha.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default {
  getNotificaciones,
  getNotificacionesNoLeidas,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  crearNotificacion,
  verificarNotificacionesHabitos,
  mostrarNotificacion,
  solicitarPermisoNotificaciones,
  formatearFechaNotificacion,
  playNotificationSound
};
