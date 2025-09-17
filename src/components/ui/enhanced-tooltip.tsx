import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EnhancedTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  contentClassName?: string;
}

const EnhancedTooltip = ({ 
  children, 
  content, 
  side = "right", 
  className,
  contentClassName 
}: EnhancedTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className={cn(
            "bg-gray-900/95 backdrop-blur-sm border border-gray-500/50 text-white shadow-xl z-50",
            contentClassName
          )}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { EnhancedTooltip };


