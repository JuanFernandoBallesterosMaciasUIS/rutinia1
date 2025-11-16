import { useState, useEffect } from 'react';

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const dayNamesShort = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const dayNamesDisplay = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function Calendar({ habitsData, completedHabits }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month'); // 'month' o 'week'

  // Función para formatear fecha como YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para verificar si un hábito aplica en un día específico
  const habitAppliesToDay = (habit, date) => {
    if (habit.frequency === 'diario') {
      return true;
    }
    
    if (habit.frequency === 'semanal') {
      const dayName = dayNamesShort[date.getDay()];
      return habit.days && habit.days.includes(dayName);
    }
    
    if (habit.frequency === 'mensual') {
      // Verificar si el día del mes está en los días configurados
      const dayOfMonth = date.getDate(); // Día del mes (1-31)
      return habit.days && habit.days.includes(dayOfMonth);
    }
    
    return false;
  };

  // Función para obtener el progreso de un día
  const getDayProgress = (date) => {
    const dateStr = formatDate(date);
    const completed = completedHabits[dateStr] || [];
    
    // Obtener hábitos que aplican ese día
    const applicableHabits = habitsData.filter(habit => habitAppliesToDay(habit, date));
    
    if (applicableHabits.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    const completedCount = applicableHabits.filter(habit => 
      completed.includes(habit.id)
    ).length;
    
    return {
      total: applicableHabits.length,
      completed: completedCount,
      percentage: Math.round((completedCount / applicableHabits.length) * 100)
    };
  };

  // Renderizar días del mes
  const renderMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Ajustar para que la semana empiece en lunes (1 = Lunes en lugar de Domingo = 0)
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convertir domingo (0) a 6, resto restar 1
    
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const today = new Date();
    const todayStr = formatDate(today);
    
    // Días vacíos antes del primer día
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === formatDate(selectedDate);
      const progress = getDayProgress(date);
      
      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`aspect-square rounded-lg border-2 ${
            isSelected 
              ? 'border-primary bg-primary bg-opacity-10' 
              : 'border-gray-200 dark:border-gray-700'
          } p-2 cursor-pointer hover:border-primary transition-all flex flex-col`}
        >
          <div className={`text-sm font-semibold ${
            isToday 
              ? 'text-primary' 
              : 'text-text-light dark:text-text-dark'
          } mb-1`}>
            {day}
          </div>
          
          {progress.total > 0 && (
            <div className="flex-1 flex flex-col justify-end">
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    progress.percentage === 100 ? 'bg-green-500' : 'bg-primary'
                  } rounded-full transition-all`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="text-xs text-center text-subtext-light dark:text-subtext-dark mt-1">
                {progress.completed}/{progress.total}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Renderizar vista semanal
  const renderWeekDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    const currentDay = new Date(year, month, day);
    
    // Ajustar para que la semana empiece en lunes
    let dayOfWeek = currentDay.getDay();
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convertir domingo a 6, resto restar 1
    
    const weekStart = new Date(currentDay);
    weekStart.setDate(currentDay.getDate() - dayOfWeek); // Restar para llegar al lunes
    
    const days = [];
    const today = new Date();
    const todayStr = formatDate(today);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = formatDate(date);
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === formatDate(selectedDate);
      const progress = getDayProgress(date);
      
      days.push(
        <div
          key={i}
          onClick={() => setSelectedDate(date)}
          className={`rounded-lg border-2 ${
            isSelected 
              ? 'border-primary bg-primary bg-opacity-10' 
              : 'border-gray-200 dark:border-gray-700'
          } p-3 cursor-pointer hover:border-primary transition-all flex flex-col min-h-[120px]`}
        >
          <div className={`text-lg font-semibold ${
            isToday 
              ? 'text-primary' 
              : 'text-text-light dark:text-text-dark'
          } mb-2`}>
            {date.getDate()}
          </div>
          
          {progress.total > 0 && (
            <div className="flex-1 flex flex-col justify-end">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${
                    progress.percentage === 100 ? 'bg-green-500' : 'bg-primary'
                  } rounded-full transition-all`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <div className="text-sm text-center text-subtext-light dark:text-subtext-dark">
                {progress.completed}/{progress.total}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  // Obtener título del calendario
  const getCalendarTitle = () => {
    if (currentView === 'month') {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    } else {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const day = currentDate.getDate();
      
      const currentDay = new Date(year, month, day);
      
      // Ajustar para que la semana empiece en lunes
      let dayOfWeek = currentDay.getDay();
      dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      const weekStart = new Date(currentDay);
      weekStart.setDate(currentDay.getDate() - dayOfWeek);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const startMonth = monthNames[weekStart.getMonth()];
      const endMonth = monthNames[weekEnd.getMonth()];
      const startDay = weekStart.getDate();
      const endDay = weekEnd.getDate();
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${startDay} - ${endDay} de ${startMonth} ${year}`;
      } else {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
      }
    }
  };

  // Navegar mes/semana anterior
  const handlePrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  // Navegar mes/semana siguiente
  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  // Renderizar hábitos del día seleccionado
  const renderHabitsForDay = () => {
    const dateStr = formatDate(selectedDate);
    const completed = completedHabits[dateStr] || [];
    
    const applicableHabits = habitsData.filter(habit => habitAppliesToDay(habit, selectedDate));
    
    if (applicableHabits.length === 0) {
      return (
        <div className="text-center py-8 text-subtext-light dark:text-subtext-dark">
          <span className="material-icons text-5xl mb-2">event_busy</span>
          <p>No hay hábitos programados para este día</p>
        </div>
      );
    }
    
    const colorClasses = {
      indigo: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-500',
      green: 'bg-green-100 dark:bg-green-900 text-green-500',
      blue: 'bg-blue-100 dark:bg-blue-900 text-blue-500',
      purple: 'bg-purple-100 dark:bg-purple-900 text-purple-500',
      red: 'bg-red-100 dark:bg-red-900 text-red-500',
      yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-500',
      pink: 'bg-pink-100 dark:bg-pink-900 text-pink-500',
      orange: 'bg-orange-100 dark:bg-orange-900 text-orange-500',
    };
    
    return applicableHabits.map(habit => {
      const isCompleted = completed.includes(habit.id);
      
      return (
        <div
          key={habit.id}
          className={`bg-background-light dark:bg-background-dark rounded-lg p-4 flex items-center justify-between ${
            isCompleted ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <div className={`w-10 h-10 rounded-lg ${colorClasses[habit.color]} flex items-center justify-center flex-shrink-0`}>
              <span className="material-icons text-lg">{habit.icon}</span>
            </div>
            <span className={`font-semibold text-text-light dark:text-text-dark ${
              isCompleted ? 'line-through' : ''
            }`}>
              {habit.name}
            </span>
          </div>
          {/* Icono de estado (solo visualización, no se puede hacer clic) */}
          <div className="p-2">
            <span className={`material-icons text-2xl ${
              isCompleted 
                ? 'text-green-500' 
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </div>
        </div>
      );
    });
  };

  const dayOfMonth = selectedDate.getDate();
  const month = monthNames[selectedDate.getMonth()];
  const year = selectedDate.getFullYear();

  return (
    <div>
      {/* Navegación del calendario */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevious}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-icons text-text-light dark:text-text-dark">chevron_left</span>
          </button>
          <span className="text-lg font-semibold text-text-light dark:text-text-dark px-4">
            {getCalendarTitle()}
          </span>
          <button 
            onClick={handleNext}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="material-icons text-text-light dark:text-text-dark">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Selector de vista */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setCurrentView('month')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentView === 'month'
              ? 'bg-primary text-white'
              : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
          }`}
        >
          Mes
        </button>
        <button 
          onClick={() => setCurrentView('week')}
          className={`px-4 py-2 rounded-lg font-semibold ${
            currentView === 'week'
              ? 'bg-primary text-white'
              : 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
          }`}
        >
          Semana
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-card-light dark:bg-card-dark rounded-large p-4 sm:p-6 shadow-sm mb-6">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNamesDisplay.map((day, index) => (
            <div key={index} className="text-center font-semibold text-sm text-subtext-light dark:text-subtext-dark">
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes o semana */}
        <div className={`grid ${currentView === 'month' ? 'grid-cols-7' : 'grid-cols-7'} gap-2`}>
          {currentView === 'month' ? renderMonthDays() : renderWeekDays()}
        </div>
      </div>

      {/* Resumen de hábitos del día seleccionado */}
      <div className="bg-card-light dark:bg-card-dark rounded-large p-4 sm:p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
            Hábitos del {dayOfMonth} de {month} de {year}
          </h2>
          <div className="flex items-center gap-2 text-xs text-subtext-light dark:text-subtext-dark bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
            <span className="material-icons text-sm">info</span>
            <span>Solo visualización</span>
          </div>
        </div>
        <p className="text-sm text-subtext-light dark:text-subtext-dark mb-4">
          Para marcar hábitos como completados, ve a la sección "Hábitos del día"
        </p>
        <div className="space-y-3">
          {renderHabitsForDay()}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
