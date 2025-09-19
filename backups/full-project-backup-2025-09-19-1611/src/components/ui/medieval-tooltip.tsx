import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface MedievalTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  contentClassName?: string;
  delayDuration?: number;
}

const MedievalTooltip = ({ 
  children, 
  content, 
  side = "right", 
  className,
  contentClassName,
  delayDuration = 300
}: MedievalTooltipProps) => {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={cn(
            // Базовые стили для большей прозрачности и размытия
            "bg-black/60 backdrop-blur-lg border border-amber-500/40 text-white shadow-2xl z-50",
            // Плавные анимации
            "animate-in fade-in-0 zoom-in-95 duration-200",
            // Средневековые декоративные элементы
            "relative overflow-hidden",
            // Градиентная рамка
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-amber-500/10 before:via-transparent before:to-amber-600/10 before:pointer-events-none",
            // Внутренняя тень для глубины
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.05),inset_0_-1px_0_rgba(0,0,0,0.2)]",
            // Внешнее свечение
            "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
            contentClassName
          )}
          sideOffset={6}
        >
          <div className="relative z-10">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { MedievalTooltip };
