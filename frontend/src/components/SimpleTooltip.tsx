import React from 'react';
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

interface SimpleTooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  className?: string;
  sideOffset?: number;
  delayDuration?: number;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const SimpleTooltip = ({ 
  children, 
  content, 
  className,
  sideOffset = 4,
  delayDuration = 250,
  onClick,
  ...props 
}: SimpleTooltipProps) => {
  const child = React.cloneElement(children, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      onClick?.(e);
      // Call the original onClick if it exists
      if (children.props.onClick) {
        children.props.onClick(e);
      }
    }
  });

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {child}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Content
          sideOffset={sideOffset}
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};