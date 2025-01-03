import { create } from 'zustand';

interface LogsState {
  logs: string[];
  setLogs: (newLogs: string[]) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
}

const useLogsStore = create<LogsState>()((set) => ({
  logs: [],

  setLogs: (newLogs) => set({ logs: newLogs }),
  addLog: (log) => set((state) => ({ 
    logs: [...state.logs, log] 
  })),
  clearLogs: () => set({ logs: [] })
}));

export default useLogsStore;