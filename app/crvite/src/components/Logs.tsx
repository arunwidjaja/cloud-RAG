import React from 'react';

interface LogsProps {
  logs: string[];
}
interface LogProps {
  log: string;
}

export const Logs: React.FC<LogsProps> = ({ logs }) => {
  return (
    <div className='text-text font-mono text-xs'>
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

