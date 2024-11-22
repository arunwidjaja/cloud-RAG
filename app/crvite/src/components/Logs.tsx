import React from 'react';

interface LogsProps {
  logs: string[];
}
interface LogProps {
  log: string;
}

export const Logs: React.FC<LogsProps> = ({ logs }) => {
  return (
    <div className='text-accent font-mono text-xs overflow-auto h-full whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full'>
      {logs.map((log, index) => (
        <Log
          key={index}
          log={log}
        />
      ))}
    </div>
  )
};

export const Log: React.FC<LogProps> = ({ log }) => {
  return (
    <div>
      {log}
    </div>
  )
};

