import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGoToLogin = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/login');
    }, 500); // Mantener sincronía con la guía (500ms)
  };

  const handleScrollToFeatures = (e) => {
    e.preventDefault();
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 animate-fade-in'
      }`}
    >
      {/* Hero Section - Pantalla completa */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <main className="relative w-full max-w-6xl z-10">
          {/* Hero: grid 2 columnas en desktop */}
          <div className="grid items-center gap-12 lg:gap-16 lg:grid-cols-2">
            {/* Columna Izquierda: Branding + texto + CTA */}
            <div className="text-center lg:text-left space-y-8 animate-slide-up">
            {/* Logo + Marca */}
            <div className="flex items-center justify-center lg:justify-start select-none group">
              <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg ring-2 ring-purple-200/50 dark:ring-purple-800/50 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-black text-4xl md:text-5xl leading-none drop-shadow-lg">R</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <h1 className="text-[2.75rem] md:text-[3.5rem] leading-none font-black bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-500 bg-clip-text text-transparent tracking-tight -ml-1 animate-gradient bg-[length:200%_auto]">
                utinia
              </h1>
            </div>

            {/* Título y subtítulo */}
            <div className="space-y-4">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Construye mejores hábitos,{' '}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  un día a la vez
                </span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Registra tus rutinas, visualiza tu progreso y mantén la motivación con rachas y logros. Todo desde una interfaz simple y moderna.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button
                onClick={handleGoToLogin}
                disabled={isTransitioning}
                className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-semibold shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.05] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                aria-label="Comenzar ahora"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Comenzar ahora</span>
                <span className="material-icons relative z-10 transform transition-transform duration-300 group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>

              <a
                href="#features"
                onClick={handleScrollToFeatures}
                className="group inline-flex items-center gap-2 px-8 md:px-10 py-3.5 md:py-4 rounded-xl font-semibold bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg backdrop-blur-sm transition-all"
              >
                <span>Ver características</span>
                <span className="material-icons text-purple-500 transform transition-transform duration-300 group-hover:translate-y-1">expand_more</span>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Mockups flotantes (solo desktop) */}
          <div className="relative hidden lg:block">
            {/* Círculos decorativos */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-400/30 dark:bg-purple-700/30 rounded-full blur-3xl animate-gentle-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/30 dark:bg-indigo-700/30 rounded-full blur-3xl animate-gentle-pulse" style={{ animationDelay: '0.8s' }} />

            {/* Tarjeta 1 - Ejercicio */}
            <div className="animate-float [animation-delay:0s]">
              <div className="relative mx-auto w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-5 transform hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/90 text-white flex items-center justify-center shadow-md">
                      <span className="material-icons">fitness_center</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Ejercicio</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">30 min • Diario</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">Racha: 7</span>
                </div>
                <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-green-400 to-emerald-500" />
                </div>
              </div>
            </div>

            {/* Tarjeta 2 - Lectura */}
            <div className="animate-float [animation-delay:0.6s] absolute left-10 top-1/2">
              <div className="w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/90 text-white flex items-center justify-center shadow-md">
                    <span className="material-icons">menu_book</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Lectura</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">20 pág • Tardes</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Progreso semanal</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">85%</span>
                </div>
              </div>
            </div>

            {/* Tarjeta 3 - Meditación */}
            <div className="animate-float [animation-delay:1.2s] absolute right-4 bottom-4">
              <div className="w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/90 text-white flex items-center justify-center shadow-md">
                    <span className="material-icons">self_improvement</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Meditación</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">10 min • Mañanas</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-semibold">Racha: 21 días</div>
              </div>
            </div>
          </div>
          </div>
        </main>
      </section>

      {/* Sección de características */}
      <section id="features" className="relative px-4 py-20 md:py-28 bg-gradient-to-b from-transparent via-purple-50/30 to-transparent dark:via-gray-800/30">
        <div className="max-w-6xl mx-auto">
          {/* Título de la sección */}
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                Características principales
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              ¿Qué es Rutinia?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Una aplicación diseñada para ayudarte a crear y mantener hábitos saludables de forma simple y efectiva.
            </p>
          </div>

          <div className="grid gap-6 md:gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-green-500/10 hover:border-green-400 dark:hover:border-green-500 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-icons text-2xl">calendar_today</span>
              </div>
              <h3 className="mt-5 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Seguimiento diario</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Crea hábitos personalizados con frecuencia diaria, semanal o mensual. Marca tus hábitos completados cada día y observa cómo se van formando tus rutinas. La aplicación te ayuda a mantener el foco registrando tu progreso de manera visual e intuitiva.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-icons text-2xl">insights</span>
              </div>
              <h3 className="mt-5 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Estadísticas y progreso</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Visualiza tu progreso con gráficos claros y métricas detalladas. Consulta tus porcentajes de cumplimiento, días totales completados y tendencias a lo largo del tiempo. Identifica patrones y ajusta tus objetivos según tus necesidades.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400 dark:hover:border-purple-500 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="material-icons text-2xl">local_fire_department</span>
              </div>
              <h3 className="mt-5 text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Sistema de rachas</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Construye rachas consecutivas al completar tus hábitos día tras día. Cada racha muestra tu compromiso y constancia. Mantén tu impulso vivo registrando tus hábitos de forma continua.
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="material-icons text-lg text-purple-500">school</span>
              <p>
                Aplicación desarrollada por estudiantes de séptimo semestre de Ingeniería de Sistemas UIS
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Asignatura: Ingeniería de Software
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 pt-2">© 2025 Rutinia — Versión Beta</p>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default Welcome;

