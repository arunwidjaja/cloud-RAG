import {create} from 'zustand';

const useLogsStore = create((set) => ({
    logs: [],

    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  
    setLogs: (newLogs) => set({ logs: newLogs }),    
  
    clearLogs: () => set({ logs: [] }),
  }));
  
  export default useLogsStore;