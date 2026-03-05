import React, { useEffect } from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const Snackbar: React.FC = () => {
  const { snackbar, hideSnackbar } = useApp();

  useEffect(() => {
    if (snackbar.isOpen) {
      const timer = setTimeout(() => {
        hideSnackbar();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.isOpen, hideSnackbar]);

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100',
  };

  return (
    <AnimatePresence>
      {snackbar.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-24 left-6 right-6 z-[100] flex justify-center pointer-events-none"
        >
          <div className={cn(
            "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg max-w-md w-full",
            bgColors[snackbar.type]
          )}>
            <div className="flex-shrink-0">
              {icons[snackbar.type]}
            </div>
            <p className="flex-1 text-sm font-bold text-slate-800">
              {snackbar.message}
            </p>
            <button 
              onClick={hideSnackbar}
              className="p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
