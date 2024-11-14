export const Logs = ({logs}) => {
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

export const Log = ({ log }) => {
  return (
    <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
      {log}
    </div>
  )
};

