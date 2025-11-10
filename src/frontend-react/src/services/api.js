import { apiClient } from './authService';
import { getLocalDateString } from './dateHelpers';

// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api';

// ==================== AUTENTICACIÓN Y USUARIOS ====================

/**
 * Iniciar sesión de usuario
 * @param {Object} credentials - { correo, clave }
 * @returns {Promise<Object>} Usuario autenticado
 */
export const loginUsuario = async (credentials) => {
  const response = await apiClient.get('/usuarios/');
  
  const usuarios = response.data;
  
  // Buscar usuario por correo y clave (temporal, hasta implementar auth real)
  const usuario = usuarios.find(
    u => u.correo === credentials.correo && u.clave === credentials.clave
  );
  
  if (!usuario) {
    throw new Error('Credenciales inválidas');
  }
  
  return usuario;
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - { nombre, apellido, correo, clave, tema }
 * @returns {Promise<Object>} Usuario creado
 */
export const registrarUsuario = async (userData) => {
  const response = await apiClient.post('/usuarios/', {
    ...userData,
    tema: userData.tema || 'light'
  });
  return response.data;
};

/**
 * Obtener información de un usuario
 * @param {string} id - ID del usuario
 * @returns {Promise<Object>} Usuario
 */
export const getUsuario = async (id) => {
  const response = await apiClient.get(`/usuarios/${id}/`);
  return response.data;
};

/**
 * Actualizar información de usuario
 * @param {string} id - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUsuario = async (id, userData) => {
  const response = await apiClient.patch(`/usuarios/${id}/`, userData);
  return response.data;
};

// ==================== HÁBITOS ====================

/**
 * Obtener todos los hábitos del usuario con opciones de paginación y filtros
 * @param {Object} options - Opciones de consulta
 * @param {string} options.usuarioId - ID del usuario
 * @param {number} options.page - Número de página
 * @param {number} options.pageSize - Hábitos por página
 * @param {string} options.ordering - Campo para ordenar (ej: '-fecha_inicio')
 * @returns {Promise<Array|Object>} Lista de hábitos o objeto con paginación
 */
export const getHabitos = async (options = {}) => {
  const { usuarioId, page, pageSize, ordering } = options;
  
  const params = {};
  if (usuarioId) params.usuario = usuarioId;
  if (page) params.page = page;
  if (pageSize) params.page_size = pageSize;
  if (ordering) params.ordering = ordering;
  
  const response = await apiClient.get('/habitos/', { params });
  return response.data;
};

/**
 * Obtener un hábito específico por ID
 * @param {string} id - ID del hábito
 * @returns {Promise<Object>} Hábito
 */
export const getHabito = async (id) => {
  const response = await apiClient.get(`/habitos/${id}/`);
  return response.data;
};

/**
 * Crear un nuevo hábito
 * @param {Object} habitoData - Datos del hábito
 * @returns {Promise<Object>} Hábito creado
 */
export const createHabito = async (habitoData) => {
  console.log('📤 Enviando al backend:', JSON.stringify(habitoData, null, 2));
  try {
    const response = await apiClient.post('/habitos/', habitoData);
    return response.data;
  } catch (error) {
    console.error('❌ Error del backend:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Actualizar un hábito existente
 * @param {string} id - ID del hábito
 * @param {Object} habitoData - Datos actualizados
 * @returns {Promise<Object>} Hábito actualizado
 */
export const updateHabito = async (id, habitoData) => {
  console.log('📝 Actualizando hábito:', id);
  console.log('📤 Datos a enviar:', JSON.stringify(habitoData, null, 2));
  
  try {
    const response = await apiClient.patch(`/habitos/${id}/`, habitoData);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Eliminar un hábito
 * @param {string} id - ID del hábito
 * @returns {Promise<void>}
 */
export const deleteHabito = async (id) => {
  await apiClient.delete(`/habitos/${id}/`);
};

// ==================== PROGRESO DE HÁBITOS ====================

/**
 * Obtener progreso semanal de un hábito
 * @param {string} habitoId - ID del hábito
 * @returns {Promise<Object>} Progreso semanal
 */
export const getProgresoSemanal = async (habitoId) => {
  const response = await apiClient.get(`/habitos/${habitoId}/progreso_semanal/`);
  return response.data;
};

/**
 * Obtener progreso mensual de un hábito
 * @param {string} habitoId - ID del hábito
 * @returns {Promise<Object>} Progreso mensual
 */
export const getProgresoMensual = async (habitoId) => {
  const response = await apiClient.get(`/habitos/${habitoId}/progreso_mensual/`);
  return response.data;
};

/**
 * Obtener progreso de múltiples hábitos
 * @param {Array<string>} habitoIds - Array de IDs de hábitos
 * @returns {Promise<Array>} Array de progresos semanales y mensuales
 */
export const getProgresosMultiples = async (habitoIds) => {
  try {
    const progresos = await Promise.all(
      habitoIds.map(async (id) => {
        try {
          const [semanal, mensual] = await Promise.all([
            getProgresoSemanal(id),
            getProgresoMensual(id)
          ]);
          return { id, semanal, mensual };
        } catch (error) {
          console.error(`Error obteniendo progreso para hábito ${id}:`, error);
          return { id, semanal: null, mensual: null, error: error.message };
        }
      })
    );
    return progresos;
  } catch (error) {
    console.error('Error obteniendo progresos múltiples:', error);
    throw error;
  }
};

// ==================== REGISTROS DE HÁBITOS ====================

/**
 * Obtener registros de hábitos (completados)
 * @param {string} habitoId - ID del hábito (opcional)
 * @returns {Promise<Array>} Lista de registros
 */
export const getRegistros = async (habitoId = null) => {
  const params = habitoId ? { habito: habitoId } : {};
  const response = await apiClient.get('/registros/', { params });
  return response.data;
};

/**
 * Marcar o desmarcar un hábito como completado (toggle)
 * Previene duplicados y actualiza si ya existe
 * @param {string} habitoId - ID del hábito
 * @param {string} fecha - Fecha en formato 'YYYY-MM-DD'
 * @param {boolean} completado - true para marcar, false para desmarcar
 * @returns {Promise<Object>} Registro creado/actualizado
 */
export const toggleHabitoCompletado = async (habitoId, fecha, completado = true) => {
  const response = await apiClient.post('/registros/toggle_completado/', {
    habito_id: habitoId,
    fecha: fecha,
    completado: completado
  });
  return response.data;
};

/**
 * Crear un registro de hábito (marcar como completado)
 * @param {Object} registroData - { habito: id, fecha: 'YYYY-MM-DD', estado: true }
 * @returns {Promise<Object>} Registro creado
 */
export const createRegistro = async (registroData) => {
  const response = await apiClient.post('/registros/', registroData);
  return response.data;
};

/**
 * Actualizar un registro de hábito
 * @param {string} id - ID del registro
 * @param {Object} registroData - Datos actualizados
 * @returns {Promise<Object>} Registro actualizado
 */
export const updateRegistro = async (id, registroData) => {
  const response = await apiClient.patch(`/registros/${id}/`, registroData);
  return response.data;
};

/**
 * Eliminar un registro de hábito
 * @param {string} id - ID del registro
 * @returns {Promise<void>}
 */
export const deleteRegistro = async (id) => {
  await apiClient.delete(`/registros/${id}/`);
};

// ==================== CATEGORÍAS ====================

/**
 * Obtener todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategorias = async () => {
  const response = await apiClient.get('/categorias/');
  return response.data;
};

/**
 * Crear una nueva categoría
 * @param {Object} categoriaData - { nombre: string }
 * @returns {Promise<Object>} Categoría creada
 */
export const createCategoria = async (categoriaData) => {
  const response = await apiClient.post('/categorias/', categoriaData);
  return response.data;
};

// ==================== HELPERS ====================

/**
 * Mapear datos del frontend al formato del backend
 * @param {Object} frontendHabito - Hábito con formato del frontend
 * @param {string} usuarioId - ID del usuario (temporal, hasta tener auth)
 * @returns {Object} Hábito en formato backend
 */
export const mapHabitoToBackend = (frontendHabito, usuarioId = '507f1f77bcf86cd799439011') => {
  // Normalizar frecuencia
  const frecuencia = (frontendHabito.frequency || 'diario').toLowerCase();
  const tipo_frecuencia = frecuencia === 'diario' ? 'Diaria' : 
                          frecuencia === 'semanal' ? 'Semanal' : 
                          frecuencia === 'mensual' ? 'Mensual' : 'Diaria';
  
  // Preparar datos básicos
  const data = {
    usuario: usuarioId,
    nombre: frontendHabito.name,
    dificultad: 'media',
    fecha_inicio: getLocalDateString(), // Usar fecha local
    tipo_frecuencia: tipo_frecuencia,
    dias: frecuencia === 'semanal' ? (frontendHabito.days || []) : [],
    publico: false,
    activo: true,
    notificaciones: [],
    // ✨ NUEVOS CAMPOS: icono y color
    icono: frontendHabito.icon || 'fitness_center',
    color: frontendHabito.color || 'blue'
  };
  
  // Solo agregar descripción si no está vacía
  if (frontendHabito.description && frontendHabito.description.trim() !== '') {
    data.descripcion = frontendHabito.description;
  }
  
  // Solo agregar categoría si existe Y es un ObjectId válido (24 caracteres hex)
  if (frontendHabito.category && frontendHabito.category.length === 24) {
    data.categoria = frontendHabito.category;
  }
  
  return data;
};

/**
 * Mapear datos del backend al formato del frontend
 * @param {Object} backendHabito - Hábito del backend
 * @returns {Object} Hábito en formato frontend
 */
export const mapHabitoToFrontend = (backendHabito) => {
  // Normalizar frecuencia: "Diaria" -> "diario", "Semanal" -> "semanal", "Mensual" -> "mensual"
  const normalizeFrequency = (freq) => {
    if (!freq) return 'diario';
    const lower = freq.toLowerCase();
    if (lower === 'diaria') return 'diario';
    if (lower === 'semanal') return 'semanal';
    if (lower === 'mensual') return 'mensual';
    return lower;
  };

  // Normalizar categoría: Extraer nombre si es objeto, convertir a lowercase con guiones
  const normalizeCategory = (cat) => {
    console.log('🔍 Categoría del backend:', cat);
    console.log('🔍 Tipo de categoría:', typeof cat);
    
    if (!cat) return '';
    
    // Si es un objeto con nombre, usar el nombre
    const categoryName = typeof cat === 'object' ? cat.nombre : cat;
    if (!categoryName) return '';
    
    // Convertir a lowercase y reemplazar espacios con guiones
    const normalized = categoryName.toLowerCase().replace(/\s+/g, '-');
    console.log('✅ Categoría normalizada:', normalized);
    return normalized;
  };

  return {
    id: backendHabito.id,
    name: backendHabito.nombre,
    category: normalizeCategory(backendHabito.categoria),
    // ✨ Ahora icon y color vienen del backend
    icon: backendHabito.icono || 'fitness_center',
    color: backendHabito.color || 'blue',
    description: backendHabito.descripcion || '',
    frequency: normalizeFrequency(backendHabito.tipo_frecuencia),
    days: backendHabito.dias || [],
    // Campos adicionales del backend
    dificultad: backendHabito.dificultad,
    fecha_inicio: backendHabito.fecha_inicio,
    publico: backendHabito.publico,
    activo: backendHabito.activo
  };
};
