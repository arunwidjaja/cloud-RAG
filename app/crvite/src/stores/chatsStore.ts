import { create } from 'zustand';

interface ChatsState {
  chats: string[];
  setChats: (newLogs: string[]) => void;
  addChat: (log: string) => void;
  clearChats: () => void;
}

export const useChatsStore = create<ChatsState>()((set) => ({
  chats: ["Retrieval-Augmented Generation and Large Language Models","Hugging Face and Python transformers"],

  setChats: (newChats) => set({ chats: newChats }),
  addChat: (chat) => set((state) => ({ 
    chats: [...state.chats, chat] 
  })),
  clearChats: () => set({ chats: [] })
}));