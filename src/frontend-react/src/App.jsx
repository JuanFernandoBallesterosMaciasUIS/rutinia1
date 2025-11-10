import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import HabitCard from './components/HabitCard';
import NewHabitModal from './components/NewHabitModal';
import EditHabitModal from './components/EditHabitModal';
import Calendar from './components/Calendar';
import HabitsView from './components/HabitsView';
import ProgressDashboard from './components/ProgressDashboard';
import Login from './components/Login';
import Welcome from './components/Welcome';
import EditProfile from './components/EditProfile';
import { habitsData as initialHabitsData } from './data/habitsData';
import * as api from './services/api';
import { getTodayString, getLocalDateString } from './services/dateHelpers';
import * as localStorageService from './services/localStorage';

// 🔧 Función helper para normalizar nombres de días
// Convierte abreviaturas ('lun', 'mar') a nombres completos ('Lunes', 'Martes')
const normalizeDayName = (day) => {
  const dayMap = {
    'dom': 'Domingo',
    'lun': 'Lunes',
    'mar': 'Martes',
    'mie': 'Miercoles',
    'jue': 'Jueves',
    'vie': 'Viernes',
    'sab': 'Sabado',
    // También aceptar nombres completos (por si acaso)
    'Domingo': 'Domingo',
    'Lunes': 'Lunes',
    'Martes': 'Martes',
    'Miercoles': 'Miercoles',
    'Jueves': 'Jueves',
    'Viernes': 'Viernes',
    'Sabado': 'Sabado'
  };
  return dayMap[day] || day;
};

// 🔥 Función para calcular la racha actual de un hábito
// Cuenta cuántos días consecutivos (según la frecuencia del hábito) se ha completado
const calculateStreak = (habit, completedHabits) => {
  if (!habit || !completedHabits) return 0;

  const frequency = (habit.frequency || '').toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar a medianoche
  
  // Función helper para verificar si un hábito aplica en una fecha específica
  const habitAppliesOnDate = (date) => {
    if (frequency === 'diario') return true;
    
    if (frequency === 'semanal' && habit.days && habit.days.length > 0) {
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
      const dayName = dayNames[date.getDay()];
      const normalizedHabitDays = habit.days.map(day => normalizeDayName(day));
      return normalizedHabitDays.includes(dayName);
    }
    
    if (frequency === 'mensual' && habit.days && habit.days.length > 0) {
      const dayOfMonth = date.getDate(); // Día del mes (1-31)
      return habit.days.includes(dayOfMonth);
    }
    
    return false;
  };

  // Función helper para formatear fecha como "YYYY-MM-DD"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let streak = 0;
  let checkDate = new Date(today);
  let foundFirstCompletion = false;
  
  // Retroceder día por día contando días consecutivos
  for (let i = 0; i < 365; i++) { // Límite de 365 días
    const dateStr = formatDate(checkDate);
    
    // Si este día aplica para el hábito
    if (habitAppliesOnDate(checkDate)) {
      const isCompleted = completedHabits[dateStr] && completedHabits[dateStr].includes(habit.id);
      
      if (isCompleted) {
        streak++;
        foundFirstCompletion = true;
      } else {
        // Si no está completado, verificar si es hoy
        const isToday = checkDate.getTime() === today.getTime();
        
        if (isToday) {
          // Es hoy y no está completado, continuar contando (permitir que hoy no esté hecho)
          // No incrementar streak, pero no romperlo todavía
        } else if (foundFirstCompletion) {
          // Ya encontramos al menos un día completado y este día anterior no está completado
          // La racha se rompió
          break;
        }
        // Si nunca hemos encontrado un día completado, seguir buscando hacia atrás
      }
    }
    
    // Retroceder un día
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
};

// Componente simple de Toast
function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const id = Date.now();
      const newToast = { id, message: event.detail.message };
      setToasts(prev => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 3000);
    };

    window.addEventListener('showToast', handleShowToast);
    return () => window.removeEventListener('showToast', handleShowToast);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right"
        >
          <span className="material-icons">check_circle</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado de autenticación
  const [usuario, setUsuario] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('today'); // 'today', 'calendar', 'habits', 'analytics'
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [showEditHabitModal, setShowEditHabitModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [currentEditHabit, setCurrentEditHabit] = useState(null);
  const [habitsData, setHabitsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedHabits, setCompletedHabits] = useState(() => {
    return localStorageService.getCompletedHabits();
  });
  const [lastCheckedDate, setLastCheckedDate] = useState(() => {
    return localStorage.getItem('lastCheckedDate');
  });

  // Función auxiliar para obtener el ID del usuario actual
  const getUserId = () => {
    return usuario?.id || usuario?._id || null;
  };

  // Limpiar registros cuando es un nuevo día
  useEffect(() => {
    const today = getCurrentDateString(); // Usar función helper con fecha local
    
    // Si es un nuevo día, resetear el estado de completados en localStorage
    if (lastCheckedDate && lastCheckedDate !== today) {
      console.log('🔄 Nuevo día detectado. Reseteando registros del día anterior...');
      console.log(`📅 Día anterior: ${lastCheckedDate}`);
      console.log(`📅 Día actual: ${today}`);
      
      // Mantener el historial pero asegurarnos de que hoy esté limpio
      const currentCompleted = localStorageService.getCompletedHabits();
      
      // Si hay registros para hoy, limpiarlos (esto previene registros duplicados)
      if (currentCompleted[today]) {
        delete currentCompleted[today];
        localStorageService.saveCompletedHabits(currentCompleted);
        setCompletedHabits(currentCompleted);
      }
    }
    
    // Actualizar la última fecha verificada
    localStorage.setItem('lastCheckedDate', today);
    setLastCheckedDate(today);
  }, []); // Solo ejecutar una vez al montar el componente

  // Verificar si hay usuario guardado en localStorage al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUsuario(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error al parsear usuario:', error);
        localStorage.removeItem('usuario');
      }
    }
  }, []);

  // Cargar hábitos del backend al iniciar (solo si está autenticado)
  useEffect(() => {
    if (isAuthenticated && usuario) {
      loadHabitsFromBackend();
    }
  }, [isAuthenticated, usuario]);

  // Función para cargar hábitos del backend
  const loadHabitsFromBackend = async () => {
    try {
      setLoading(true);
      
      // Obtener el ID del usuario
      const userId = usuario?.id || usuario?._id;
      
      if (!userId) {
        console.error('❌ No se encontró el ID del usuario');
        setHabitsData([]);
        setLoading(false);
        return;
      }
      
      console.log('🔍 Cargando hábitos para el usuario:', userId);
      
      // Obtener solo los hábitos del usuario actual
      const backendHabits = await api.getHabitos({ usuarioId: userId });
      
      console.log(`✅ Se encontraron ${backendHabits.length} hábitos del usuario`);
      
      // Mapear hábitos del backend al formato frontend
      const mappedHabits = backendHabits.map(habit => 
        api.mapHabitoToFrontend(habit)
      );
      
      setHabitsData(mappedHabits);
      
      // Cargar registros de todos los hábitos desde el backend
      await loadRegistrosFromBackend(mappedHabits);
      
    } catch (error) {
      console.error('Error al cargar hábitos:', error);
      setHabitsData([]);
      showErrorMessage('No se pudieron cargar los hábitos. Verifica que el servidor esté corriendo en http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar registros desde el backend
  const loadRegistrosFromBackend = async (habits) => {
    try {
      console.log('🔍 Cargando registros de hábitos desde el backend...');
      
      // Obtener todos los registros de todos los hábitos
      const allRegistros = await api.getRegistros();
      
      console.log(`✅ Se encontraron ${allRegistros.length} registros`);
      
      // Convertir registros a formato { 'YYYY-MM-DD': [habitId1, habitId2, ...] }
      const completedByDate = {};
      
      allRegistros.forEach(registro => {
        if (registro.estado === true) {
          const fecha = registro.fecha; // Ya viene en formato YYYY-MM-DD
          const habitoId = typeof registro.habito === 'object' ? registro.habito.id : registro.habito;
          
          if (!completedByDate[fecha]) {
            completedByDate[fecha] = [];
          }
          
          if (!completedByDate[fecha].includes(habitoId)) {
            completedByDate[fecha].push(habitoId);
          }
        }
      });
      
      console.log('✅ Registros organizados por fecha:', completedByDate);
      
      // Actualizar el estado y localStorage
      setCompletedHabits(completedByDate);
      localStorageService.saveCompletedHabits(completedByDate);
      
    } catch (error) {
      console.error('Error al cargar registros:', error);
    }
  };

  // Cargar tema guardado
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // 🆕 Efecto para inicializar registros del día automáticamente
  useEffect(() => {
    const initializeDailyRecords = async () => {
      if (habitsData.length === 0) return; // Esperar a que carguen los hábitos
      
      const today = getCurrentDateString();
      const currentDay = getDayOfWeek(new Date());
      
      // Obtener hábitos que aplican para hoy (misma lógica que habitAppliesToToday)
      const todayHabitsToInit = habitsData.filter(habit => {
        const frequency = (habit.frequency || '').toLowerCase();
        
        if (frequency === 'diario' || frequency === 'diaria') {
          return true;
        } else if (frequency === 'semanal') {
          // Verificar que el hábito tenga días configurados y que hoy esté incluido
          if (!habit.days || habit.days.length === 0) {
            return false;
          }
          // 🔧 NORMALIZAR LOS DÍAS: Convertir 'lun' -> 'Lunes', etc.
          const normalizedHabitDays = habit.days.map(day => normalizeDayName(day));
          return normalizedHabitDays.includes(currentDay);
        } else if (frequency === 'mensual') {
          // Los hábitos mensuales aplican solo en los días del mes configurados
          if (!habit.days || habit.days.length === 0) {
            return false;
          }
          const today = new Date();
          const dayOfMonth = today.getDate(); // Día del mes (1-31)
          return habit.days.includes(dayOfMonth);
        }
        return false;
      });
      
      console.log(`📅 Inicializando registros para ${today}...`);
      console.log(`📋 Hábitos del día: ${todayHabitsToInit.length}`);
      
      // Para cada hábito del día, verificar si ya tiene registro
      for (const habit of todayHabitsToInit) {
        const alreadyCompleted = completedHabits[today]?.includes(habit.id) || false;
        
        // Verificar si el hábito ya tiene registro en el backend
        try {
          const registros = await api.getRegistros(habit.id);
          const registroHoy = registros.find(r => r.fecha === today);
          
          if (!registroHoy) {
            // No existe registro, crear uno en false
            console.log(`➕ Creando registro en false para: ${habit.name}`);
            await api.toggleHabitoCompletado(habit.id, today, false);
          } else {
            console.log(`✓ Registro ya existe para: ${habit.name} (estado: ${registroHoy.estado})`);
            
            // Sincronizar con localStorage si el backend tiene el registro en true
            if (registroHoy.estado && !alreadyCompleted) {
              const newCompletedHabits = localStorageService.toggleHabitCompletion(habit.id, today, true);
              setCompletedHabits(newCompletedHabits);
            }
          }
        } catch (error) {
          console.error(`Error al verificar registro de ${habit.name}:`, error);
        }
      }
    };
    
    // Ejecutar solo cuando cambien los hábitos
    initializeDailyRecords();
  }, [habitsData]); // Solo cuando cambian los hábitos

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Manejar login exitoso con animación
  const handleLoginSuccess = (userData) => {
    // Pequeño delay para animación suave
    setTimeout(() => {
      setUsuario(userData);
      setIsAuthenticated(true);
      navigate('/app'); // Redirigir a /app después del login
      console.log('✅ Usuario autenticado:', userData);
    }, 300);
  };

  // Manejar logout con animación
  const handleLogout = () => {
    // Agregar clase de animación de salida
    const appElement = document.getElementById('app-content');
    if (appElement) {
      appElement.classList.add('animate-fade-out');
    }
    
    // Esperar a que termine la animación antes de limpiar el estado
    setTimeout(() => {
      setUsuario(null);
      setIsAuthenticated(false);
      localStorage.removeItem('usuario');
      setHabitsData([]);
      setCompletedHabits({});
      setCurrentView('today');
      navigate('/login'); // Redirigir a /login después del logout
      console.log('👋 Sesión cerrada');
    }, 500);
  };

  // Manejar actualización de perfil
  const handleUpdateProfile = (updatedUser) => {
    setUsuario(updatedUser);
    console.log('✅ Perfil actualizado:', updatedUser);
    // Mostrar mensaje de éxito
    showSuccessMessage('Perfil actualizado correctamente');
  };

  // Funciones para obtener día y fecha
  const getDayOfWeek = (date = new Date()) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    return days[date.getDay()];
  };

  const getCurrentDateString = () => {
    // Usar helper de dateHelpers para obtener fecha local
    return getTodayString();
  };

  // Función para cambiar de vista con animación
  const handleViewChange = (newView) => {
    if (newView === currentView || isViewTransitioning) return;
    
    setIsViewTransitioning(true);
    
    // Esperar a que termine la animación de salida antes de cambiar la vista
    setTimeout(() => {
      setCurrentView(newView);
      setIsViewTransitioning(false);
    }, 300);
  };

  // Verificar si un hábito aplica al día actual
  const habitAppliesToToday = (habit) => {
    const today = new Date();
    const currentDay = getDayOfWeek(today);
    const todayStr = getCurrentDateString();
    
    // Convertir a minúsculas para comparación
    const frequency = (habit.frequency || '').toLowerCase();
    
    if (frequency === 'diario' || frequency === 'diaria') {
      return true;
    } else if (frequency === 'semanal') {
      // Verificar que el hábito tenga días configurados y que hoy esté incluido
      if (!habit.days || habit.days.length === 0) {
        console.warn(`⚠️ Hábito semanal "${habit.name}" no tiene días configurados`);
        return false;
      }
      
      // 🔧 NORMALIZAR LOS DÍAS: Convertir 'lun' -> 'Lunes', etc.
      const normalizedHabitDays = habit.days.map(day => normalizeDayName(day));
      const applies = normalizedHabitDays.includes(currentDay);
      
      console.log(`📅 Hábito "${habit.name}"`);
      console.log(`   Días originales: [${habit.days.join(', ')}]`);
      console.log(`   Días normalizados: [${normalizedHabitDays.join(', ')}]`);
      console.log(`   Hoy: ${currentDay}`);
      console.log(`   Aplica: ${applies}`);
      
      return applies;
    } else if (frequency === 'mensual') {
      // 🔧 HÁBITOS MENSUALES: Verificar si hoy está en los días seleccionados
      if (!habit.days || habit.days.length === 0) {
        console.warn(`⚠️ Hábito mensual "${habit.name}" no tiene días configurados`);
        return false;
      }
      
      const today = new Date();
      const dayOfMonth = today.getDate(); // Día del mes (1-31)
      
      // Verificar si el día de hoy está en los días seleccionados
      const applies = habit.days.includes(dayOfMonth);
      
      console.log(`📅 Hábito mensual "${habit.name}"`);
      console.log(`   Días configurados: [${habit.days.join(', ')}]`);
      console.log(`   Hoy es día: ${dayOfMonth}`);
      console.log(`   Aplica: ${applies}`);
      
      return applies;
    }
    return false;
  };

  // Verificar si un hábito está completado hoy
  const isHabitCompletedToday = (habitId) => {
    const dateStr = getCurrentDateString();
    return completedHabits[dateStr]?.includes(habitId) || false;
  };

  // Toggle completar hábito
  const toggleHabitCompletion = async (habitId, dateStr = null) => {
    const date = dateStr || getCurrentDateString();
    const wasCompleted = completedHabits[date]?.includes(habitId) || false;
    const newStatus = !wasCompleted;
    
    // Actualizar localStorage inmediatamente (optimistic update)
    const newCompletedHabits = localStorageService.toggleHabitCompletion(habitId, date, newStatus);
    setCompletedHabits(newCompletedHabits);
    
    // Sincronizar con backend usando el nuevo endpoint que previene duplicados
    try {
      await api.toggleHabitoCompletado(habitId, date, newStatus);
    } catch (error) {
      console.error('Error al sincronizar con backend:', error);
      // Revertir el cambio en localStorage si falla
      const revertedHabits = localStorageService.toggleHabitCompletion(habitId, date, wasCompleted);
      setCompletedHabits(revertedHabits);
      showErrorMessage('Error al guardar. Intenta de nuevo.');
    }
  };

  // Obtener hábitos del día
  const todayHabits = habitsData.filter(habit => habitAppliesToToday(habit));

  // Manejar creación de nuevo hábito
  const handleCreateHabit = async (newHabitData) => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        showErrorMessage('No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // ✨ Mapear al formato del backend (INCLUYE icon y color)
      const backendData = api.mapHabitoToBackend(newHabitData, userId);
      
      // Crear en el backend
      const createdHabit = await api.createHabito(backendData);
      
      // ✨ Mapear de vuelta al frontend (icon y color ya vienen del backend)
      const frontendHabit = api.mapHabitoToFrontend(createdHabit);
      setHabitsData([...habitsData, frontendHabit]);
      
      setShowNewHabitModal(false);
      showSuccessMessage('¡Hábito creado exitosamente!');
    } catch (error) {
      console.error('Error al crear hábito:', error);
      showErrorMessage('Error al crear el hábito. Intenta de nuevo.');
    }
  };

  // Manejar edición de hábito
  const handleEditHabit = async (editedHabitData) => {
    try {
      const userId = getUserId();
      
      if (!userId) {
        showErrorMessage('No se pudo identificar el usuario. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      // ✨ Mapear al formato del backend (INCLUYE icon y color)
      const backendData = api.mapHabitoToBackend(editedHabitData, userId);
      
      // Actualizar en el backend
      const updatedHabit = await api.updateHabito(editedHabitData.id, backendData);
      
      // ✨ Actualizar en el estado local (icon y color vienen del backend)
      const frontendHabit = api.mapHabitoToFrontend(updatedHabit);
      const updatedHabits = habitsData.map(habit =>
        habit.id === editedHabitData.id ? frontendHabit : habit
      );
      setHabitsData(updatedHabits);
      
      setShowEditHabitModal(false);
      setCurrentEditHabit(null);
      showSuccessMessage('¡Hábito actualizado exitosamente!');
    } catch (error) {
      console.error('Error al actualizar hábito:', error);
      showErrorMessage('Error al actualizar el hábito. Intenta de nuevo.');
    }
  };

  // Manejar eliminación de hábito
  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
      try {
        // Eliminar del backend
        await api.deleteHabito(habitId);
        
        // ✨ YA NO necesitamos eliminar de localStorage (icon y color están en backend)
        
        // Actualizar estado local
        const updatedHabits = habitsData.filter(habit => habit.id !== habitId);
        setHabitsData(updatedHabits);
        
        setShowEditHabitModal(false);
        setCurrentEditHabit(null);
        showSuccessMessage('Hábito eliminado exitosamente');
      } catch (error) {
        console.error('Error al eliminar hábito:', error);
        showErrorMessage('Error al eliminar el hábito. Intenta de nuevo.');
      }
    }
  };

  // Abrir modal de edición
  const openEditModal = (habit) => {
    setCurrentEditHabit(habit);
    setShowEditHabitModal(true);
  };

  // Mostrar mensaje de éxito
  const showSuccessMessage = (message) => {
    const event = new CustomEvent('showToast', { detail: { message } });
    window.dispatchEvent(event);
  };

  // Mostrar mensaje de error
  const showErrorMessage = (message) => {
    const event = new CustomEvent('showToast', { detail: { message } });
    window.dispatchEvent(event);
  };

  return (
    <div className="relative w-full min-h-screen bg-background-light dark:bg-background-dark font-display">
      <Routes>
        {/* Redirección de raíz a bienvenida */}
        <Route path="/" element={<Navigate to="/bienvenida" replace />} />
        
        {/* Ruta de bienvenida */}
        <Route path="/bienvenida" element={<Welcome />} />
        
        {/* Ruta de login */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
        {/* Rutas de la aplicación principal (requiere autenticación) */}
        <Route path="/app" element={
          !isAuthenticated ? (
            <Login onLoginSuccess={handleLoginSuccess} />
          ) : (
            <div id="app-content" className="animate-content-in">
          {/* Indicador de carga minimalista */}
          {loading && (
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full w-1/4 bg-gradient-to-r from-primary via-purple-500 to-primary loading-bar"></div>
            </div>
          )}
          
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
            usuario={usuario}
            onEditProfile={() => setShowEditProfileModal(true)}
          />

          {/* Overlay para móvil */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

      {/* Modal para crear nuevo hábito */}
      <NewHabitModal
        isOpen={showNewHabitModal}
        onClose={() => setShowNewHabitModal(false)}
        onSubmit={handleCreateHabit}
      />

      {/* Modal para editar hábito */}
      {currentEditHabit && (
        <EditHabitModal
          isOpen={showEditHabitModal}
          onClose={() => {
            setShowEditHabitModal(false);
            setCurrentEditHabit(null);
          }}
          onSubmit={handleEditHabit}
          onDelete={handleDeleteHabit}
          habitData={currentEditHabit}
        />
      )}

      {/* Modal para editar perfil */}
      <EditProfile
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        usuario={usuario}
        onUpdateSuccess={handleUpdateProfile}
      />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300 ease-in-out min-h-screen">
        {/* Header fijo con título de sección */}
        <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  className="relative p-2 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="material-icons text-text-light dark:text-text-dark">menu</span>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background-light dark:border-background-dark"></span>
                </button>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-light dark:text-text-dark">
                  {currentView === 'today' && 'Hábitos del día'}
                  {currentView === 'calendar' && 'Calendario'}
                  {currentView === 'habits' && 'Todos mis hábitos'}
                  {currentView === 'analytics' && 'Dashboard de Progreso'}
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal con padding para header y footer */}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-40 sm:pb-36 lg:pb-16">
          <div className={`view-container ${isViewTransitioning ? 'view-transition-exit' : 'view-transition-enter'}`}>
            {currentView === 'today' && (
              <div>
                {/* Grid de hábitos */}
                <div className="habits-grid mb-8">
                  {todayHabits.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <span className="material-icons text-6xl text-subtext-light dark:text-subtext-dark mb-4">event_available</span>
                      <p className="text-xl text-subtext-light dark:text-subtext-dark">No hay hábitos para hoy</p>
                      <p className="text-sm text-subtext-light dark:text-subtext-dark mt-2">¡Disfruta tu día libre!</p>
                    </div>
                  ) : (
                    todayHabits.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={{
                          ...habit,
                          streak: calculateStreak(habit, completedHabits)
                        }}
                        isCompleted={isHabitCompletedToday(habit.id)}
                        onComplete={toggleHabitCompletion}
                        onEdit={openEditModal}
                        showCompleteButton={true}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {currentView === 'calendar' && (
              <Calendar 
                habitsData={habitsData}
                completedHabits={completedHabits}
              />
            )}

            {currentView === 'habits' && (
              <HabitsView 
                habits={habitsData}
                completedHabits={completedHabits}
                calculateStreak={calculateStreak}
                onEditHabit={openEditModal}
                onDeleteHabit={handleDeleteHabit}
              />
            )}

            {currentView === 'analytics' && (
              <ProgressDashboard habitos={habitsData} completedHabits={completedHabits} />
            )}
          </div>
        </main>

        {/* Footer Navigation */}
        <Footer 
          onAddHabit={() => setShowNewHabitModal(true)}
          currentView={currentView}
          onChangeView={handleViewChange}
        />
              </div>

              {/* Toast Container */}
              <ToastContainer />
            </div>
          )
        } />
      </Routes>
    </div>
  );
}

export default App;
