import { create } from 'zustand';
import { Message } from '@/types/types';
import useMessageStore from './messageStore';

interface Chat {
  id: string;
  subject: string;
  messages: Message[]
}

interface ChatsState {
  chats: Chat[];
  addChat: (chat: Chat) => void;
}

export const createChat = (): Chat => ({
  id: 'testchatid',
  subject: 'testchatsubject',
  messages: useMessageStore.getState().messages
});

export const useChatsStore = create<ChatsState>()((set) => ({
  chats: [],
  addChat: (chat) => set((state) =>({
    chats: [chat, ...state.chats]
  }))
}));