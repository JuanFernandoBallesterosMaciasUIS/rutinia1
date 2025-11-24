function Footer({ onAddHabit, currentView, onChangeView }) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 lg:left-72 bg-card-light dark:bg-card-dark p-2 sm:p-3 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)] z-30 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => onChangeView('today')}
            className={`flex flex-col items-center p-2 transition-all hover:scale-110 ${
              currentView === 'today' 
                ? 'text-primary' 
                : 'text-subtext-light dark:text-subtext-dark'
            }`}
          >
            <span className="material-icons text-xl sm:text-2xl">today</span>
            <span className={`text-xs sm:text-sm ${currentView === 'today' ? 'font-medium' : ''}`}>
              Hoy
            </span>
          </button>
          <button 
            onClick={() => onChangeView('calendar')}
            className={`flex flex-col items-center p-2 transition-all hover:scale-110 ${
              currentView === 'calendar' 
                ? 'text-primary' 
                : 'text-subtext-light dark:text-subtext-dark'
            }`}
          >
            <span className="material-icons text-xl sm:text-2xl">calendar_today</span>
            <span className={`text-xs sm:text-sm ${currentView === 'calendar' ? 'font-medium' : ''}`}>
              Calendario
            </span>
          </button>
          <button 
            onClick={onAddHabit}
            className="bg-primary text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center -translate-y-6 sm:-translate-y-8 shadow-lg hover:shadow-xl transition-all hover:scale-110"
          >
            <span className="material-icons" style={{ fontSize: '28px' }}>add</span>
          </button>
          <button 
            onClick={() => onChangeView('habits')}
            className={`flex flex-col items-center p-2 transition-all hover:scale-110 ${
              currentView === 'habits' 
                ? 'text-primary' 
                : 'text-subtext-light dark:text-subtext-dark'
            }`}
          >
            <span className="material-icons text-xl sm:text-2xl">checklist</span>
            <span className={`text-xs sm:text-sm ${currentView === 'habits' ? 'font-medium' : ''}`}>
              Hábitos
            </span>
          </button>
          <button 
            onClick={() => onChangeView('analytics')}
            className={`flex flex-col items-center p-2 transition-all hover:scale-110 ${
              currentView === 'analytics' 
                ? 'text-primary' 
                : 'text-subtext-light dark:text-subtext-dark'
            }`}
          >
            <span className="material-icons text-xl sm:text-2xl">insights</span>
            <span className={`text-xs sm:text-sm ${currentView === 'analytics' ? 'font-medium' : ''}`}>
              Dashboard
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
