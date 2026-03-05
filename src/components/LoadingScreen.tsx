import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-mymo flex flex-col items-center justify-center z-[9999]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center gap-4"
      >
        <Logo light className="scale-150" />
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white text-sm font-medium tracking-wide italic"
        >
          oh! mymo (my money) is here!
        </motion.p>
      </motion.div>
      
      {/* Subtle pulse animation for the background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-64 h-64 bg-white rounded-full blur-3xl -z-10"
      />
    </div>
  );
};
