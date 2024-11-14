import { create } from 'zustand';

const useMessageStore = create((set) => ({
    messages: [],

    setMessages: (newMessages) => set({ messages: newMessages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    clearMessages: () => set({ messages: [] })
}));

export default useMessageStore;