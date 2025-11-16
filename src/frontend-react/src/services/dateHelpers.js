/**
 * Helper para obtener fechas en formato YYYY-MM-DD usando la hora local
 * en lugar de UTC, evitando problemas de zona horaria.
 */

/**
 * Convierte un objeto Date a string YYYY-MM-DD usando la hora LOCAL
 * (no UTC) para evitar que a las 9pm cambie al día siguiente.
 * 
 * @param {Date} date - Objeto Date (por defecto: fecha actual)
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha actual como string YYYY-MM-DD en hora local
 * 
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 */
export const getTodayString = () => {
  return getLocalDateString(new Date());
};

/**
 * Convierte una fecha Date a string para enviar al backend
 * Usa hora local para evitar problemas de zona horaria
 * 
 * @param {Date} date - Objeto Date
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const formatDateForBackend = (date) => {
  return getLocalDateString(date);
};
