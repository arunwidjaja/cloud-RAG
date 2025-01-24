import { create } from 'zustand';
import { ContextData } from '../types/types';
import { generate_message_id } from '@/utils/utils';

// InputMessage is for user inputs
interface InputMessage{
    id: string;
    type: string;
    text: string;
}

// AnswerMessage is for any responses not containing context information
interface AnswerMessage {
    id: string;
    type: string;
    text: string;
}

// ContextMessage is for RAG responses with associated context information
interface ContextMessage{
    id: string;
    type: string;
    text: string;
    content: ContextData[];
}

// Union type for all message types
type Message = InputMessage | AnswerMessage | ContextMessage;

// Store interface
interface MessageState {
    messages: Message[];
    setMessages: (newMessages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (updated_message: Message) => void;
    clearMessages: () => void;
}

// Factory functions to create type-safe messages
export const createInputMessage = (text: string): InputMessage => ({
    id: generate_message_id('msg'),
    type: 'input',
    text: text
});

export const createAnswerMessage = (text: string): AnswerMessage => ({
    id: generate_message_id('msg'),
    type: 'answer',
    text: text
});

export const createContextMessage = (context_list: ContextData[]): ContextMessage => ({
    id: generate_message_id('msg'),
    type: 'context',
    text: 'Context Used:',
    content: context_list
});

// Store implementation
const useMessageStore = create<MessageState>()((set) => ({
    messages: [],
    setMessages: (newMessages) => set({ messages: newMessages }),
    addMessage: (message) => set((state) => ({
        messages: [message, ...state.messages]
    })),
    updateMessage: (updated_message) => set((state) => ({
        messages: [updated_message, ...state.messages.slice(1)]
    })),
    clearMessages: () => set({ messages: [] })
}));

export default useMessageStore;