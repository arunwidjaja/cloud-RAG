import useLogsStore from "../stores/logsStore";

export const add_log = (log) => {
    const addLog = useLogsStore.getState().addLog;
    addLog(log)
};

export const set_logs = (logs) => {
    const setLogs = useLogsStore.getState().setLogs;
    setLogs(logs)
};

export const clear_logs = () => {
    const clearLogs = useLogsStore.getState().clearLogs;
    clearLogs();
};