import { cn } from "@/lib/utils";

interface DividerProps {
  color?: string;
  className?: string;
  containerClassName?: string;
  padding?: string;
}

// Horizontal divider that starts from right and extends left
export const HorizontalLine = () => {
  return (
    <div className="relative">
      <div className="right-0 -mr-4 left-[-100%] border border-black" />
    </div>
  );
};

// Vertical divider component
export const VerticalDivider = ({
  color = "#e5e7eb",
  className,
  containerClassName,
  padding = "16px"
}: DividerProps) => {
  return (
    <div 
      className={cn(
        "flex h-[calc(100vh+1px)]",
        containerClassName
      )}
    >
      <div
        className={cn(
          "w-px h-full bg-gray-600",
          className
        )}
        style={{
          margin: `0 ${padding}`,
          backgroundColor: color
        }}
      />
    </div>
  );
};