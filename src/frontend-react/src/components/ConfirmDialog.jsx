import { useEffect } from 'react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card-light dark:bg-card-dark rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono central */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="material-icons text-red-600 dark:text-red-400 text-3xl">
              delete_outline
            </span>
          </div>
        </div>

        {/* Título y mensaje */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">
            {title}
          </h3>
          <p className="text-sm text-subtext-light dark:text-subtext-dark">
            {message}
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base bg-gray-100 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-600 transition-all order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-sm sm:text-base border-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all order-1 sm:order-2"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
