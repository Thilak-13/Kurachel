import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const isSuccess = type === 'success';

  return (
    <div 
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 ${
        isSuccess 
          ? 'bg-emerald-55 bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50 border-rose-100 text-rose-800'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
      )}
      <span className="text-sm font-bold">{message}</span>
      <button 
        onClick={onClose}
        className={`p-0.5 rounded-lg transition-colors ml-2 ${
          isSuccess ? 'hover:bg-emerald-100 text-emerald-600' : 'hover:bg-rose-100 text-rose-600'
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
