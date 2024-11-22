import { cn } from "@/lib/utils";

interface DividerProps {
  color?: string;
  className?: string;
  containerClassName?: string;
  padding?: string;
}

const VerticalDivider = ({
  color = "#e5e7eb",
  className,
  containerClassName,
  padding = "1rem"
}: DividerProps) => {
  return (
    <div 
      className={cn(
        "flex h-[calc(100vh+1px)]", // Extend 1px beyond viewport height
        containerClassName
      )}
    >
      <div
        className={cn(
          "w-px h-full border border-gray-600",
          className
        )}
        style={{
          margin: `0 ${padding}`,
          paddingTop: 0,
          marginTop: 0,
          backgroundColor: color
        }}
      />
    </div>
  );
};

export default VerticalDivider;