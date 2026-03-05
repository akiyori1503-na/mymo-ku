import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, light = false }) => {
  return (
    <div className={cn("flex items-center select-none font-logo text-2xl tracking-tight", className, light ? "text-white" : "text-mymo")}>
      <span className="font-normal">my</span>
      <span className="font-bold">mo</span>
    </div>
  );
};
