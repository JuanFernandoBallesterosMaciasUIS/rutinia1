const HabitCard = ({ 
  habit, 
  onComplete, 
  isCompleted = false, 
  onEdit, 
  onDelete,
  showCompleteButton = false 
}) => {
  // Mapa de colores
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    pink: 'bg-pink-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500'
  };

  // Función para formatear la frecuencia
  const formatFrequency = () => {
    if (habit.frequency === 'diario' || habit.frequency === 'Diaria') {
      return 'Todos los días';
    } else if (habit.frequency === 'semanal' || habit.frequency === 'Semanal') {
      const dayNames = {
        'lun': 'L', 'mar': 'M', 'mie': 'X', 
        'jue': 'J', 'vie': 'V', 'sab': 'S', 'dom': 'D'
      };
      const days = habit.days && habit.days.length > 0
        ? habit.days.map(d => dayNames[d] || d).join(', ')
        : '';
      return days || 'Semanal';
    } else if (habit.frequency === 'mensual' || habit.frequency === 'Mensual') {
      // Mostrar los días del mes si están configurados
      const days = habit.days && habit.days.length > 0
        ? habit.days.sort((a, b) => a - b).join(', ')
        : '';
      return days ? `Días: ${days}` : 'Mensual';
    }
    return habit.frequency;
  };

  // Manejar clic en editar
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(habit);
    }
  };

  // Manejar clic en completar
  const handleComplete = (e) => {
    e.stopPropagation();
    if (onComplete) {
      onComplete(habit.id);
    }
  };

  return (
    <div
      className={`bg-card-light dark:bg-card-dark rounded-large p-4 sm:p-6 shadow-sm hover:shadow-md transition-all relative ${
        isCompleted ? 'opacity-80' : ''
      }`}
    >
      {/* Header: Icono, Título y Botón de Editar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Icono del hábito */}
          <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colorClasses[habit.color] || 'bg-blue-500'} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="material-icons text-white text-2xl sm:text-3xl">
              {habit.icon || 'fitness_center'}
            </span>
          </div>
          
          {/* Título y categoría */}
          <div className="flex-1 min-w-0">
            <h3 
              className={`font-semibold text-base sm:text-lg text-text-light dark:text-text-dark truncate cursor-help ${
                isCompleted ? 'line-through' : ''
              }`}
              title={habit.name}
            >
              {habit.name}
            </h3>
            <p className="text-xs sm:text-sm text-subtext-light dark:text-subtext-dark truncate" title={habit.category}>
              {habit.category}
            </p>
          </div>
        </div>
        
        {/* Botón de editar */}
        <button 
          onClick={handleEdit}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all flex-shrink-0"
          aria-label="Editar hábito"
        >
          <span className="material-icons text-subtext-light dark:text-subtext-dark text-xl">
            edit
          </span>
        </button>
      </div>

      {/* Información del hábito y botón de completar */}
      <div className="flex items-end justify-between">
        <div className="space-y-2 flex-1">
          {/* Frecuencia */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-subtext-light dark:text-subtext-dark">
            <span className="material-icons text-sm sm:text-base">schedule</span>
            <span>{formatFrequency()}</span>
          </div>
          
          {/* Racha */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-subtext-light dark:text-subtext-dark">
            <span className="material-icons text-sm sm:text-base">local_fire_department</span>
            <span>{habit.streak || 0} días</span>
          </div>
        </div>

        {/* Botón de completar circular en la esquina inferior derecha */}
        {showCompleteButton && (
          <button
            onClick={handleComplete}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={isCompleted ? 'Hábito completado' : 'Marcar como completado'}
          >
            <span className={`material-icons text-3xl transition-colors ${
              isCompleted 
                ? 'text-green-500' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
