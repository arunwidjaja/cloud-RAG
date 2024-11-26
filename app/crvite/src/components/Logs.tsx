import useLogsStore from '@/stores/logsStore';


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
  return (
    <div className='flex flex-1 flex-col text-left p-1 bg-text m-2 rounded-sm'>
      <div className='text-accent font-mono text-xs overflow-auto h-full whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full'>
        {logs.map((log, index) => (
          <Log
            key={index}
            log={log}
          />
        ))}
      </div>
    </div>
  )
};