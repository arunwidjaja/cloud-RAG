import { create } from 'zustand';
import { ContextData } from '../types/types';
import { generate_message_id } from '@/utils/utils';

// Base Message interface with common properties
interface BaseMessage {
    id: string;
    text: string;
}

// InputMessage is for user inputs
interface InputMessage extends BaseMessage {
    type: string;
}

// AnswerMessage is for any responses not containing context information
interface AnswerMessage extends BaseMessage {
    type: string;
}

// ContextMessage is for RAG responses with associated context information
interface ContextMessage extends BaseMessage {
    type: string;
    context_list: ContextData[];
}

// Union type for all message types
type Message = InputMessage | AnswerMessage | ContextMessage;

// Store interface
interface MessageState {
    messages: Message[];
    setMessages: (newMessages: Message[]) => void;
    addMessage: (message: Message) => void;
    clearMessages: () => void;
}

// Factory functions to create type-safe messages
export const createInputMessage = (text: string): InputMessage => ({
    id: generate_message_id('msg'),
    type: 'input',
    text
});

export const createAnswerMessage = (text: string): AnswerMessage => ({
    id: generate_message_id('msg'),
    type: 'answer',
    text
});

export const createContextMessage = (text: string, context_list: ContextData[]): ContextMessage => ({
    id: generate_message_id('msg'),
    type: 'context',
    text,
    context_list
});

// Store implementation
const useMessageStore = create<MessageState>()((set) => ({
    messages: [],
    setMessages: (newMessages) => set({ messages: newMessages }),
    addMessage: (message) => set((state) => ({
        messages: [message, ...state.messages]
    })),
    clearMessages: () => set({ messages: [] })
}));

export default useMessageStore;