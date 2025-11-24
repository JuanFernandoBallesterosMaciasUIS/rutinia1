import { useState, useEffect } from 'react';
import ProgressCard from './ProgressCard';
import { getProgresosMultiples } from '../services/api';
import { getLocalDateString, getTodayString } from '../services/dateHelpers';

const ProgressDashboard = ({ habitos, completedHabits }) => {
  const [progresos, setProgresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'alto', 'medio', 'bajo'
  const [refreshKey, setRefreshKey] = useState(0);
  const [dashboardView, setDashboardView] = useState('overview'); // 'overview', 'habits'
  const [selectedWeek, setSelectedWeek] = useState(new Date()); // Fecha para la gráfica semanal
  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Fecha para la gráfica mensual

  const fetchProgresos = async () => {
    if (!habitos || habitos.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const habitoIds = habitos.map(h => h.id);
      const progresosData = await getProgresosMultiples(habitoIds);
      setProgresos(progresosData);
    } catch (error) {
      console.error('Error al cargar progresos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    fetchProgresos();
  }, [habitos, refreshKey]);

  // Recargar datos cuando el componente se monta (útil al cambiar de vista)
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const getProgresoPromedio = () => {
    if (progresos.length === 0) return 0;

    const suma = progresos.reduce((acc, p) => {
      if (p.semanal && p.semanal.progreso_semanal !== undefined) {
        return acc + p.semanal.progreso_semanal;
      }
      return acc;
    }, 0);

    return Math.round(suma / progresos.length);
  };

  const getHabitosFiltrados = () => {
    if (filtro === 'todos') return habitos;

    return habitos.filter(habito => {
      // Buscar el progreso del hábito
      const progreso = progresos.find(p => p.id === habito.id);
      
      // Si no hay datos de progreso, excluir del filtro
      if (!progreso || !progreso.semanal) {
        console.log(`⚠️ No se encontró progreso semanal para: ${habito.name}`);
        return false;
      }

      // Recalcular el porcentaje correcto basado en la frecuencia del hábito
      const completados = progreso.semanal.completados || 0;
      let total = 0;

      // Calcular el total esperado según la frecuencia
      if (habito.frequency === 'diario' || habito.frequency === 'Diario') {
        total = 7; // Toda la semana
      } else if (habito.frequency === 'semanal' || habito.frequency === 'Semanal') {
        total = habito.days && habito.days.length > 0 ? habito.days.length : 1;
      } else if (habito.frequency === 'mensual' || habito.frequency === 'Mensual') {
        // Para mensuales, verificar cuántos días del mes caen en esta semana
        if (progreso.semanal.inicio_semana && progreso.semanal.fin_semana && habito.days) {
          const [yearInicio, mesInicio, diaInicio] = progreso.semanal.inicio_semana.split('-').map(Number);
          const [yearFin, mesFin, diaFin] = progreso.semanal.fin_semana.split('-').map(Number);
          
          const fechaInicio = new Date(yearInicio, mesInicio - 1, diaInicio);
          const fechaFin = new Date(yearFin, mesFin - 1, diaFin);
          
          let contadorDias = 0;
          const fechaActual = new Date(fechaInicio);
          
          while (fechaActual <= fechaFin) {
            const diaDelMes = fechaActual.getDate();
            if (habito.days.includes(diaDelMes)) {
              contadorDias++;
            }
            fechaActual.setDate(fechaActual.getDate() + 1);
          }
          
          total = contadorDias;
        } else {
          total = progreso.semanal.total || 0;
        }
      }

      // Calcular el porcentaje real
      const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;
      
      console.log(`📊 ${habito.name}: ${completados}/${total} = ${porcentaje}% (Filtro: ${filtro})`);

      // Aplicar filtros
      if (filtro === 'alto') return porcentaje >= 70;
      if (filtro === 'medio') return porcentaje >= 40 && porcentaje < 70;
      if (filtro === 'bajo') return porcentaje < 40;

      return true;
    });
  };

  // Función auxiliar para normalizar nombres de días
  const normalizeDayName = (dayName) => {
    const dayMap = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miércoles': 'Miercoles',
      'miercoles': 'Miercoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sabado',
      'sabado': 'Sabado',
      'domingo': 'Domingo'
    };
    return dayMap[dayName.toLowerCase()] || dayName;
  };

  // Función auxiliar para obtener el nombre del día
  const getDayName = (date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return days[date.getDay()];
  };

  // Función auxiliar para contar hábitos que aplican en un día específico
  const getHabitsForDay = (date) => {
    const dayName = getDayName(date);
    const dayOfMonth = date.getDate(); // Día del mes (1-31)
    
    return habitos.filter(habit => {
      // Si el hábito es diario, aplica todos los días
      if (habit.frequency === 'diario') {
        return true;
      }
      
      // Si es semanal, verificar si aplica en este día de la semana
      if (habit.frequency === 'semanal') {
        if (!habit.days || habit.days.length === 0) {
          return false;
        }
        const normalizedHabitDays = habit.days.map(day => normalizeDayName(day));
        return normalizedHabitDays.includes(dayName);
      }
      
      // Si es mensual, verificar si aplica en este día del mes
      if (habit.frequency === 'mensual') {
        if (!habit.days || habit.days.length === 0) {
          return false;
        }
        return habit.days.includes(dayOfMonth);
      }
      
      return false;
    });
  };

  // Función para obtener datos de progreso semanal (de lunes a domingo)
  const getWeeklyData = (weekDate = selectedWeek) => {
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const targetDate = new Date(weekDate);
    
    // Ajustar para que la semana empiece en lunes (1 = Lunes, 0 = Domingo)
    let currentDay = targetDate.getDay();
    currentDay = currentDay === 0 ? 6 : currentDay - 1; // Convertir domingo (0) a 6, y el resto restar 1

    const weeklyData = daysOfWeek.map((day, index) => {
      const date = new Date(targetDate);
      date.setDate(targetDate.getDate() - (currentDay - index));

      const dateStr = getLocalDateString(date); // Usar fecha local
      
      // Obtener hábitos que aplican para este día específico
      const habitsForDay = getHabitsForDay(date);
      const totalHabits = habitsForDay.length;
      
      // Contar solo los hábitos completados que también aplican para este día
      const completedHabitIds = completedHabits[dateStr] || [];
      const completedCount = completedHabitIds.filter(habitId => 
        habitsForDay.some(h => h.id === habitId)
      ).length;

      return {
        day,
        date: dateStr,
        completed: completedCount,
        total: totalHabits,
        percentage: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0
      };
    });

    return weeklyData;
  };

  // Función para obtener datos de progreso mensual (organizado en semanas de lunes a domingo)
  const getMonthlyData = (monthDate = selectedMonth) => {
    const targetMonth = monthDate.getMonth();
    const targetYear = monthDate.getFullYear();

    // Primer día del mes
    const firstDay = new Date(targetYear, targetMonth, 1);
    // Último día del mes
    const lastDay = new Date(targetYear, targetMonth + 1, 0);
    
    // Ajustar para que las semanas empiecen en lunes
    // Si el mes empieza en lunes (1), dayOfWeek = 0; si es domingo (0), dayOfWeek = 6
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const monthlyData = [];

    // Agregar días del mes anterior para completar la primera semana
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(targetYear, targetMonth, -i);
      const dateStr = getLocalDateString(date); // Usar fecha local
      
      // Obtener hábitos que aplican para este día específico
      const habitsForDay = getHabitsForDay(date);
      const totalHabits = habitsForDay.length;
      
      // Contar solo los hábitos completados que también aplican para este día
      const completedHabitIds = completedHabits[dateStr] || [];
      const completedCount = completedHabitIds.filter(habitId => 
        habitsForDay.some(h => h.id === habitId)
      ).length;

      monthlyData.push({
        day: date.getDate(),
        date: dateStr,
        completed: completedCount,
        total: totalHabits,
        percentage: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0,
        isCurrentMonth: false
      });
    }

    // Agregar todos los días del mes actual
    const daysInMonth = lastDay.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const dateStr = getLocalDateString(date); // Usar fecha local
      
      // Obtener hábitos que aplican para este día específico
      const habitsForDay = getHabitsForDay(date);
      const totalHabits = habitsForDay.length;
      
      // Contar solo los hábitos completados que también aplican para este día
      const completedHabitIds = completedHabits[dateStr] || [];
      const completedCount = completedHabitIds.filter(habitId => 
        habitsForDay.some(h => h.id === habitId)
      ).length;

      monthlyData.push({
        day,
        date: dateStr,
        completed: completedCount,
        total: totalHabits,
        percentage: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0,
        isCurrentMonth: true
      });
    }

    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 7 - (monthlyData.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(targetYear, targetMonth + 1, day);
        const dateStr = getLocalDateString(date); // Usar fecha local
        
        // Obtener hábitos que aplican para este día específico
        const habitsForDay = getHabitsForDay(date);
        const totalHabits = habitsForDay.length;
        
        // Contar solo los hábitos completados que también aplican para este día
        const completedHabitIds = completedHabits[dateStr] || [];
        const completedCount = completedHabitIds.filter(habitId => 
          habitsForDay.some(h => h.id === habitId)
        ).length;

        monthlyData.push({
          day: date.getDate(),
          date: dateStr,
          completed: completedCount,
          total: totalHabits,
          percentage: totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0,
          isCurrentMonth: false
        });
      }
    }

    return monthlyData;
  };

  // Funciones para navegar entre semanas
  const navigateWeek = (direction) => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(selectedWeek.getDate() + (direction * 7));
    setSelectedWeek(newDate);
  };

  // Funciones para navegar entre meses
  const navigateMonth = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  // Función para volver a la semana/mes actual
  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  // Función para verificar si estamos en la semana/mes actual
  const isCurrentWeek = () => {
    const today = new Date();
    const todayWeek = getWeekNumber(today);
    const selectedWeekNum = getWeekNumber(selectedWeek);
    return todayWeek === selectedWeekNum && today.getFullYear() === selectedWeek.getFullYear();
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return today.getMonth() === selectedMonth.getMonth() && today.getFullYear() === selectedMonth.getFullYear();
  };

  // Función helper para obtener el número de semana
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const habitosFiltrados = getHabitosFiltrados();
  const progresoPromedio = getProgresoPromedio();
  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();

  // Componente para gráfica semanal
  const WeeklyChart = () => {
    // Calcular el rango de fechas de la semana (de lunes a domingo)
    const startOfWeek = new Date(selectedWeek);
    let currentDay = startOfWeek.getDay();
    // Ajustar para que la semana empiece en lunes
    currentDay = currentDay === 0 ? 6 : currentDay - 1;
    startOfWeek.setDate(selectedWeek.getDate() - currentDay);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Formatear el rango de fechas
    const formatWeekRange = () => {
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const startMonth = startOfWeek.toLocaleDateString('es-ES', { month: 'short' });
      const endMonth = endOfWeek.toLocaleDateString('es-ES', { month: 'short' });
      const year = selectedWeek.getFullYear();

      if (startMonth === endMonth) {
        return `${startDay}-${endDay} ${startMonth} ${year}`;
      } else {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Progreso Semanal
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Semana anterior"
            >
              <span className="material-icons text-gray-600 dark:text-gray-400">chevron_left</span>
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[140px] text-center">
              {formatWeekRange()}
            </span>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Semana siguiente"
            >
              <span className="material-icons text-gray-600 dark:text-gray-400">chevron_right</span>
            </button>
            {!isCurrentWeek() && (
              <button
                onClick={goToCurrentWeek}
                className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                title="Ir a la semana actual"
              >
                Hoy
              </button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          {weeklyData.map((data, index) => {
            const formattedDate = new Date(data.date).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short' 
            });
            
            // Verificar si es el día actual
            const today = new Date();
            const isToday = data.date === getTodayString();
            
            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 group relative transition-all duration-200 ${isToday ? 'scale-[1.02]' : ''}`}
                title={`${formattedDate}: ${data.completed} de ${data.total} hábitos completados`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-10 text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {data.day}
                  </div>
                  {isToday && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 relative">
                  <div className={`w-full rounded-full h-2 ${isToday ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isToday 
                          ? 'bg-blue-500 shadow-sm shadow-blue-500/50' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    ></div>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-semibold">{formattedDate}</div>
                    <div>{data.completed} de {data.total} hábitos completados</div>
                    <div className="text-indigo-300">{data.percentage}% de progreso</div>
                    {/* Flecha del tooltip */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                </div>
                <div className={`w-12 text-sm font-medium text-right ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {data.percentage}%
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
};

  // Componente para gráfica mensual
  const MonthlyChart = () => {
    const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Progreso Mensual
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Mes anterior"
            >
              <span className="material-icons text-gray-600 dark:text-gray-400">chevron_left</span>
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[120px] text-center">
              {selectedMonth.toLocaleDateString('es-ES', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Mes siguiente"
            >
              <span className="material-icons text-gray-600 dark:text-gray-400">chevron_right</span>
            </button>
            {!isCurrentMonth() && (
              <button
                onClick={goToCurrentMonth}
                className="ml-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                title="Ir al mes actual"
              >
                Hoy
              </button>
            )}
          </div>
        </div>
        
        {/* Encabezados de días de la semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-xs font-semibold text-center text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Grid de días del mes */}
        <div className="grid grid-cols-7 gap-2">
          {monthlyData.map((data, index) => {
            const formattedDate = new Date(data.date).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'short' 
            });
            
            // Verificar si es el día actual
            const today = new Date();
            const isToday = data.date === getTodayString();
            
            return (
              <div 
                key={index} 
                className={`flex flex-col items-center gap-1 group relative transition-transform duration-200 ${isToday ? 'scale-110' : ''}`}
                title={`${formattedDate}: ${data.completed} de ${data.total} hábitos completados`}
              >
                <div className={`text-xs font-medium ${
                  !data.isCurrentMonth 
                    ? 'text-gray-300 dark:text-gray-600' 
                    : isToday 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {data.day}
                </div>
                <div className="relative">
                  <div className={`w-6 h-6 rounded-md relative overflow-hidden ${
                    !data.isCurrentMonth
                      ? 'bg-gray-50 dark:bg-gray-800/30'
                      : isToday 
                        ? 'bg-blue-100 dark:bg-blue-900/30 ring-1 ring-blue-500' 
                        : 'bg-gray-100 dark:bg-gray-700/50'
                  }`}>
                    <div
                      className={`absolute bottom-0 left-0 right-0 rounded-md transition-all duration-300 ${
                        !data.isCurrentMonth
                          ? 'bg-gradient-to-t from-gray-300 to-gray-400 opacity-30'
                          : isToday 
                            ? 'bg-blue-500 shadow-sm shadow-blue-500/30' 
                            : 'bg-gradient-to-t from-indigo-400 to-purple-500'
                      }`}
                      style={{ height: `${Math.min(data.percentage / 100 * 24, 24)}px` }}
                    ></div>
                  </div>
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  )}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="font-semibold">{formattedDate}</div>
                  <div>{data.completed} de {data.total} hábitos</div>
                  <div className="text-indigo-300">{data.percentage}% completado</div>
                  {/* Flecha del tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Cada barra representa el porcentaje de hábitos completados ese día
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!habitos || habitos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-icons text-gray-300 dark:text-gray-600 text-6xl sm:text-8xl mb-4">
            insights
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No hay hábitos para mostrar
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Crea tu primer hábito para ver tu progreso aquí
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación del dashboard */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setDashboardView('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                dashboardView === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
              }`}
            >
              <span className="material-icons text-lg mr-2">dashboard</span>
              Resumen
            </button>
            <button
              onClick={() => setDashboardView('habits')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                dashboardView === 'habits'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
              }`}
            >
              <span className="material-icons text-lg mr-2">checklist</span>
              Hábitos
            </button>
          </div>
        </div>

        {/* Vista de Resumen */}
        {dashboardView === 'overview' && (
          <div className="animate-fade-in">
            {/* Stats Card */}
            <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-4 sm:p-6 text-white relative">
                {/* Botón de actualizar en la esquina superior derecha */}
                <button
                  onClick={handleRefresh}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 p-3 rounded-lg bg-white/20 hover:bg-white/40 active:bg-white/50 text-white transition-colors z-10 cursor-pointer"
                  title="Actualizar datos"
                  disabled={loading}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <span className={`material-icons ${loading ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm opacity-90 mb-1">Progreso Promedio</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-3xl sm:text-4xl font-bold">{progresoPromedio}%</span>
                      <span className="material-icons text-2xl">trending_up</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm opacity-90 mb-1">Total de Hábitos</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-3xl sm:text-4xl font-bold">{habitos.length}</span>
                      <span className="material-icons text-2xl">emoji_events</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm opacity-90 mb-1">Activos Esta Semana</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-3xl sm:text-4xl font-bold">
                        {progresos.filter(p => p.semanal && p.semanal.completados > 0).length}
                      </span>
                      <span className="material-icons text-2xl">check_circle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficas de resumen */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <WeeklyChart />
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <MonthlyChart />
              </div>
            </div>
          </div>
        )}

        {/* Vista de Hábitos Individuales */}
        {dashboardView === 'habits' && (
          <>
            {/* Filtros */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltro('todos')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center gap-1.5 ${
                    filtro === 'todos'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <span className="material-icons text-base sm:text-lg">apps</span>
                  <span>Todos ({habitos.length})</span>
                </button>
                <button
                  onClick={() => setFiltro('alto')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center gap-1.5 ${
                    filtro === 'alto'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <span className="material-icons text-base sm:text-lg">trending_up</span>
                  <span className="hidden sm:inline">Alto Rendimiento (≥70%)</span>
                  <span className="sm:hidden">Alto (≥70%)</span>
                </button>
                <button
                  onClick={() => setFiltro('medio')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center gap-1.5 ${
                    filtro === 'medio'
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <span className="material-icons text-base sm:text-lg">show_chart</span>
                  <span className="hidden sm:inline">Rendimiento Medio (40-69%)</span>
                  <span className="sm:hidden">Medio (40-69%)</span>
                </button>
                <button
                  onClick={() => setFiltro('bajo')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm flex items-center gap-1.5 ${
                    filtro === 'bajo'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm'
                  }`}
                >
                  <span className="material-icons text-base sm:text-lg">warning</span>
                  <span className="hidden sm:inline">Necesita Atención (&lt;40%)</span>
                  <span className="sm:hidden">Bajo (&lt;40%)</span>
                </button>
              </div>
            </div>

            {/* Grid de Progress Cards */}
            {habitosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {habitosFiltrados.map(habito => (
                  <ProgressCard key={habito.id} habito={habito} />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 sm:p-12 text-center">
                <span className="material-icons text-gray-300 dark:text-gray-600 text-5xl sm:text-6xl mb-4">
                  filter_alt_off
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No hay hábitos en esta categoría
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                  Intenta con otro filtro para ver tus hábitos
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default ProgressDashboard;
