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
  /**
   * Creates a new chat from the current messages state.
   * If a chat already exists with the same first message ID, it will update that chat.
   * If not, it will add this new chat to the chats state
   */
  updateChats: () => void;
  setChats: (chats: Chat[]) => void;
  getCurrentChat: () => Chat;
}

export const createChat = (id: string = '', subject: string = '', messages: Message[] = []): Chat => ({
    id,
    subject,
    messages
})

const useChatsStore = create<ChatsState>()((set) => ({
  chats: [],
  updateChats: () => {
    const msgs = useMessageStore.getState().messages
    if (msgs.length === 0) return;
    // chat ID is the same as the ID of its oldest (first) message
    // messages are stored chronologically, so this would be the last message in the array
    const current_chat_id = `chat_${msgs[msgs.length - 1].id}`;
    const newChat = createChat(
      current_chat_id,
      msgs[msgs.length - 1].text, 
      msgs
    )

    set((state) => {
      const chat_exists = state.chats.some(chat => chat.id === current_chat_id);
      if (chat_exists) {
        return {
          chats: state.chats.map(chat =>
            chat.id === current_chat_id ? newChat : chat
          )
        };
      }
      return { chats: [newChat, ...state.chats] };
    })
  },
  setChats: (newChats) => set({ chats: newChats }),
  getCurrentChat: () => {
    const msgs = useMessageStore.getState().messages;
    if (msgs.length === 0) return createChat();
    const current_chat_id = `chat_${msgs[msgs.length - 1].id}`;
    const current_chat = createChat(
      current_chat_id,
      msgs[msgs.length - 1].text, 
      msgs
    )
    return current_chat
  }
}));

export default useChatsStore