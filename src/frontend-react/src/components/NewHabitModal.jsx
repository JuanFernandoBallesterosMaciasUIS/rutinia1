import { useState, useEffect } from 'react';
import { availableIcons, availableColors, categories, frequencies, daysOfWeek } from '../data/habitsData';

function NewHabitModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    icon: 'article',
    color: 'green',
    description: '',
    frequency: '',
    days: [],
    notificaciones: []
  });

  const [selectedIcon, setSelectedIcon] = useState('article');
  const [selectedColor, setSelectedColor] = useState('green');
  const [selectedDays, setSelectedDays] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [newNotificationTime, setNewNotificationTime] = useState('');

  // Manejar cierre con animación
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        name: '',
        category: '',
        icon: 'article',
        color: 'green',
        description: '',
        frequency: '',
        days: [],
        notificaciones: []
      });
      setSelectedIcon('article');
      setSelectedColor('green');
      setSelectedDays([]);
      setNewNotificationTime('');
    }
  }, [isOpen]);

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
    setFormData({ ...formData, icon });
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setFormData({ ...formData, color });
  };

  const handleDayToggle = (day) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    setFormData({ ...formData, days: newDays });
  };

  // Manejar cambio de frecuencia (limpiar días cuando cambia)
  const handleFrequencyChange = (newFrequency) => {
    // Si la frecuencia cambia, limpiar los días seleccionados
    setSelectedDays([]);
    setFormData({ 
      ...formData, 
      frequency: newFrequency,
      days: [] // Limpiar días al cambiar frecuencia
    });
  };

  // Agregar notificación
  const handleAddNotification = () => {
    if (!newNotificationTime) {
      alert('Por favor ingresa una hora para la notificación');
      return;
    }

    // Validar formato HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newNotificationTime)) {
      alert('Por favor ingresa una hora válida en formato HH:MM (ej: 08:00, 14:30)');
      return;
    }

    // Verificar que no exista ya
    const exists = formData.notificaciones.some(n => n.hora === newNotificationTime);
    if (exists) {
      alert('Ya existe una notificación para esta hora');
      return;
    }

    const newNotification = {
      hora: newNotificationTime,
      activa: true
    };

    setFormData({
      ...formData,
      notificaciones: [...formData.notificaciones, newNotification]
    });
    setNewNotificationTime('');
  };

  // Eliminar notificación
  const handleRemoveNotification = (hora) => {
    setFormData({
      ...formData,
      notificaciones: formData.notificaciones.filter(n => n.hora !== hora)
    });
  };

  // Toggle activar/desactivar notificación
  const handleToggleNotification = (hora) => {
    setFormData({
      ...formData,
      notificaciones: formData.notificaciones.map(n =>
        n.hora === hora ? { ...n, activa: !n.activa } : n
      )
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aplicar valores por defecto si no se seleccionaron
    const dataToSubmit = {
      ...formData,
      icon: formData.icon || 'article',
      color: formData.color || 'green'
    };
    
    if (formData.frequency === 'semanal' && selectedDays.length === 0) {
      alert('Por favor selecciona al menos un día de la semana');
      return;
    }
    
    if (formData.frequency === 'mensual' && selectedDays.length === 0) {
      alert('Por favor selecciona al menos un día del mes');
      return;
    }
    
    onSubmit(dataToSubmit);
  };

  const getIconColorClass = (iconName) => {
    const icon = availableIcons.find(i => i.name === iconName);
    const colorMap = {
      indigo: 'text-indigo-500',
      green: 'text-green-500',
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      red: 'text-red-500',
      yellow: 'text-yellow-500',
      pink: 'text-pink-500',
      orange: 'text-orange-500',
      gray: 'text-gray-600',
      brown: 'text-brown-500'
    };
    return icon ? colorMap[icon.color] || 'text-gray-600' : 'text-gray-600';
  };

  const getColorBgClass = (color) => {
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
    return colorMap[color] || colorMap.blue;
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2 sm:p-4 modal-backdrop ${
        isClosing ? 'modal-overlay-exit' : 'modal-overlay-enter'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-card-light dark:bg-card-dark rounded-lg sm:rounded-large p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl ${
          isClosing ? 'modal-content-exit' : 'modal-content-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3 sm:mb-4 modal-header-enter">
          <h2 className="text-lg sm:text-xl font-bold text-text-light dark:text-text-dark">Nuevo Hábito</h2>
          <button 
            className="text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            onClick={handleClose}
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 modal-body-enter">
          {/* Nombre y Categoría en dos columnas en pantallas grandes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nombre del hábito */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Nombre del hábito *
              </label>
              <input 
                type="text" 
                required
                placeholder="Ej: Hacer ejercicio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Categoría
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Icono y Color en dos columnas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Icono */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Icono (opcional)
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {availableIcons.map(icon => (
                  <button 
                    key={icon.name}
                    type="button"
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-2 rounded-lg border-2 hover:border-primary transition-all ${
                      selectedIcon === icon.name
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className={`material-icons text-lg ${getIconColorClass(icon.name)}`}>
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Color del icono (opcional)
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {availableColors.map(color => (
                  <button 
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`p-2 aspect-square rounded-lg border-2 hover:scale-105 transition-transform ${getColorBgClass(color)} ${
                      selectedColor === color
                        ? 'ring-2 ring-primary'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Frecuencia y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Frecuencia */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Frecuencia *
              </label>
              <select 
                required
                value={formData.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Selecciona la frecuencia</option>
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Descripción (opcional)
              </label>
              <textarea 
                rows="2"
                placeholder="Describe tu hábito..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Notificaciones */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-2">
              🔔 Notificaciones (opcional)
            </label>
            <p className="text-xs text-subtext-light dark:text-subtext-dark mb-3">
              Configura recordatorios para este hábito
            </p>

            {/* Input para agregar nueva notificación */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <input
                  type="time"
                  value={newNotificationTime}
                  onChange={(e) => setNewNotificationTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="HH:MM"
                />
              </div>
              <button
                type="button"
                onClick={handleAddNotification}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
              >
                <span className="material-icons text-sm">add</span>
                Agregar
              </button>
            </div>

            {/* Lista de notificaciones configuradas */}
            {formData.notificaciones.length > 0 && (
              <div className="space-y-2">
                {formData.notificaciones.map((notif) => (
                  <div
                    key={notif.hora}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleNotification(notif.hora)}
                      className={`p-1 rounded transition-all ${
                        notif.activa
                          ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20'
                          : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                      title={notif.activa ? 'Desactivar' : 'Activar'}
                    >
                      <span className="material-icons text-lg">
                        {notif.activa ? 'notifications_active' : 'notifications_off'}
                      </span>
                    </button>
                    <span className={`flex-1 text-sm font-medium ${
                      notif.activa
                        ? 'text-text-light dark:text-text-dark'
                        : 'text-gray-400 line-through'
                    }`}>
                      {notif.hora}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNotification(notif.hora)}
                      className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                      title="Eliminar"
                    >
                      <span className="material-icons text-lg">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.notificaciones.length === 0 && (
              <div className="text-center py-4 text-xs text-subtext-light dark:text-subtext-dark">
                No hay notificaciones configuradas
              </div>
            )}
          </div>

          {/* Selector de días de la semana (solo visible cuando es semanal) */}
          {formData.frequency === 'semanal' && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Días de la semana *
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {daysOfWeek.map(day => (
                  <button 
                    key={day.value}
                    type="button"
                    onClick={() => handleDayToggle(day.value)}
                    className={`px-1 py-2 rounded-lg border-2 hover:border-primary transition-all text-center ${
                      selectedDays.includes(day.value)
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-semibold">{day.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de días del mes (solo visible cuando es mensual) */}
          {formData.frequency === 'mensual' && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Días del mes * <span className="text-xs font-normal text-subtext-light dark:text-subtext-dark">(Selecciona los días en que quieres realizar este hábito)</span>
              </label>
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <button 
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-1 py-2 rounded-lg border-2 hover:border-primary transition-all text-center ${
                      selectedDays.includes(day)
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-semibold">{day}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 sm:gap-3 pt-2 modal-footer-enter">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm sm:text-base rounded-lg border-2 border-gray-300 dark:border-gray-600 text-text-light dark:text-text-dark font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 text-sm sm:text-base rounded-lg bg-primary text-white font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              Crear Hábito
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewHabitModal;
