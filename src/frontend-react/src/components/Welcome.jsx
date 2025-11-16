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
      <section className="min-h-screen flex items-center justify-center px-4 py-10">
        <main className="relative w-full max-w-6xl">
          {/* Hero: grid 2 columnas en desktop */}
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Columna Izquierda: Branding + texto + CTA */}
            <div className="text-center lg:text-left space-y-6">
            {/* Logo + Marca */}
            <div className="flex items-center justify-center lg:justify-start select-none">
              <div className="relative flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg ring-1 ring-white/60 dark:ring-white/10 mr-2">
                <span className="text-white font-black text-4xl md:text-5xl leading-none drop-shadow">R</span>
              </div>
              <h1 className="text-[2.75rem] md:text-[3.5rem] leading-none font-black bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-tight -ml-1">
                utinia
              </h1>
            </div>

            {/* Título y subtítulo */}
            <div className="space-y-3">
              <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                Construye mejores hábitos, un día a la vez
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto lg:mx-0">
                Registra tus rutinas, visualiza tu progreso y mantén la motivación con rachas y logros. Todo desde una interfaz simple y moderna.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={handleGoToLogin}
                disabled={isTransitioning}
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-2xl hover:scale-[1.03] active:scale-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Comenzar ahora"
              >
                <span>Comenzar ahora</span>
                <span className="material-icons transform transition-transform duration-300 group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </button>

              <a
                href="#features"
                onClick={handleScrollToFeatures}
                className="inline-flex items-center gap-2 px-6 md:px-7 py-3 rounded-lg font-semibold bg-white/70 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all"
              >
                <span>Ver características</span>
                <span className="material-icons text-purple-500">expand_more</span>
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
      <section id="features" className="px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Título de la sección */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              ¿Qué es Rutinia?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Una aplicación diseñada para ayudarte a crear y mantener hábitos saludables de forma simple y efectiva.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group p-6 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-green-300 dark:hover:border-green-600 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white flex items-center justify-center shadow-md">
                <span className="material-icons text-2xl">calendar_today</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Seguimiento diario</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Crea hábitos personalizados con frecuencia diaria, semanal o mensual. Marca tus hábitos completados cada día y observa cómo se van formando tus rutinas. La aplicación te ayuda a mantener el foco registrando tu progreso de manera visual e intuitiva.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-indigo-400 to-cyan-500 text-white flex items-center justify-center shadow-md">
                <span className="material-icons text-2xl">insights</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Estadísticas y progreso</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Visualiza tu progreso con gráficos claros y métricas detalladas. Consulta tus porcentajes de cumplimiento, días totales completados y tendencias a lo largo del tiempo. Identifica patrones y ajusta tus objetivos según tus necesidades.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 text-white flex items-center justify-center shadow-md">
                <span className="material-icons text-2xl">local_fire_department</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Sistema de rachas</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                Construye rachas consecutivas al completar tus hábitos día tras día. Cada racha muestra tu compromiso y constancia. Mantén tu impulso vivo registrando tus hábitos de forma continua.
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Aplicación desarrollada por estudiantes de séptimo semestre de Ingeniería de Sistemas UIS
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Asignatura: Ingeniería de Software
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 Rutinia — Versión Beta</p>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default Welcome;

