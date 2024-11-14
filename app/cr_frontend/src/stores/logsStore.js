import {create} from 'zustand';

const useLogsStore = create((set) => ({
    logs: [],

    setLogs: (newLogs) => set({ logs: newLogs }),  
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [] }),
  }));
  
  export default useLogsStore;