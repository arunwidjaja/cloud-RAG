import { Loader } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Spinner = ({ 
  size = 24, 
  color = "currentColor",
  className = "" 
}: SpinnerProps) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader 
        className="animate-spin text-highlight" 
        size={size} 
        color={color}
      />
    </div>
  );
};

export default Spinner;