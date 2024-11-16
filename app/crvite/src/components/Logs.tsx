import React from 'react';

interface LogsProps {
  logs: string[];
}
interface LogProps {
  log: string;
}

export const Logs: React.FC<LogsProps> = ({ logs }) => {
  return (
    <div>
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
    <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
      {log}
    </div>
  )
};

