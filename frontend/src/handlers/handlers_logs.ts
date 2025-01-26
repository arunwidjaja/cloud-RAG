import useLogsStore from "../stores/logsStore";

export function add_log(log: string) {
    const addLog = useLogsStore.getState().addLog;
    addLog(log)
};

export function set_logs(logs: string[]) {
    const setLogs = useLogsStore.getState().setLogs;
    setLogs(logs)
};

export function clear_logs() {
    const clearLogs = useLogsStore.getState().clearLogs;
    clearLogs();
};