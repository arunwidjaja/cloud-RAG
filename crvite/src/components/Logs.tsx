import useLogsStore from '@/stores/logsStore';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';


type LogProps = {
  log: string;
}

export function Log({ log }: LogProps) {
  return (
    <div>
      {log}
    </div>
  );
}

export function Logs() {
  const { logs } = useLogsStore();
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="p-2 flex flex-col text-accent relative z-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-1 bg-background flex items-center justify-between cursor-pointer border-t border-border"
      >
        <span className="text-sm font-medium">{isExpanded ? 'Hide Logs' : 'Show Logs'}</span>
        <ChevronUp
          className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''
            }`}
        />
      </button>
      <div
        className='mt-2 flex flex-1 flex-col text-left rounded-sm bg-text'
      >
        <div
          style={{ height: isExpanded ? '16rem' : '0'}}
          className='transition-[height] duration-1000 ease-in-out font-mono text-xs overflow-hidden h-full whitespace-nowrap [-webkit-scrollbar]:hidden'
        >
          {logs.map((log, index) => (
            <Log
              key={index}
              log={log}
            />
          ))}
        </div>
      </div>
    </div>
  )
};