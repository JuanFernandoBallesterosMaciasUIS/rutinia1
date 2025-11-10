import { useState, useEffect } from 'react';
import { availableIcons, availableColors, categories, frequencies, daysOfWeek } from '../data/habitsData';

const EditHabitModal = ({ isOpen, onClose, onSubmit, onDelete, habitData }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    icon: '',
    color: '',
    description: '',
    frequency: '',
    days: []
  });

  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isClosing, setIsClosing] = useState(false);

  // Manejar cierre con animación
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 250);
  };

  useEffect(() => {
    if (isOpen && habitData) {
      // Los datos ya vienen normalizados desde api.js (mapHabitoToFrontend)
      setFormData({
        id: habitData.id || '',
        name: habitData.name || '',
        category: habitData.category || '',
        icon: habitData.icon || '',
        color: habitData.color || '',
        description: habitData.description || '',
        frequency: habitData.frequency || '',
        days: habitData.days || []
      });
      
      setSelectedIcon(habitData.icon || null);
      setSelectedColor(habitData.color || null);
      setSelectedDays(habitData.days || []);
    }
  }, [isOpen, habitData]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.icon) {
      alert('Por favor selecciona un icono');
      return;
    }
    
    if (!formData.color) {
      alert('Por favor selecciona un color');
      return;
    }
    
    if (formData.frequency === 'semanal' && selectedDays.length === 0) {
      alert('Por favor selecciona al menos un día de la semana');
      return;
    }
    
    if (formData.frequency === 'mensual' && selectedDays.length === 0) {
      alert('Por favor selecciona al menos un día del mes');
      return;
    }
    
    onSubmit(formData);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
      onDelete(formData.id);
    }
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
          <h2 className="text-lg sm:text-xl font-bold text-text-light dark:text-text-dark">Editar Hábito</h2>
          <button 
            className="text-subtext-light dark:text-subtext-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            onClick={handleClose}
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 modal-body-enter">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Categoría *
              </label>
              <select 
                required
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Icono *
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

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Color *
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-text-light dark:text-text-dark mb-1">
                Frecuencia *
              </label>
              <select 
                required
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="">Selecciona la frecuencia</option>
                {frequencies.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>

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

          <div className="flex gap-2 sm:gap-3 pt-2 modal-footer-enter">
            <button 
              type="button" 
              onClick={handleDelete}
              className="px-4 py-2 text-sm sm:text-base rounded-lg border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900 transition-all"
            >
              Eliminar
            </button>
            
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHabitModal;
