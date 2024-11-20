import { create } from 'zustand';
import { ContextData } from '../types/types';

// Base Message interface with common properties
interface BaseMessage {
    type: string;
    text: string;
    context_list?: ContextData[]
}

// InputMessage is for user inputs
// Contains type and text
interface InputMessage extends BaseMessage {
    type: 'input';
    text: string;
}

// AnswerMessage is for any responses not containing context information
// Contains type and text
interface AnswerMessage extends BaseMessage {
    type: 'answer';
    text: string;
}

// ContextMessage is for RAG responses with associated context information
// In addition to type and text (the answer), contains an array of ContextData objects
interface ContextMessage extends BaseMessage {
    type: 'context';
    text: string;
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
    type: 'input',
    text
});

export const createAnswerMessage = (text: string): AnswerMessage => ({
    type: 'answer',
    text
});

export const createContextMessage = (text: string, context_list: ContextData[]): ContextMessage => ({
    type: 'context',
    text,
    context_list
});

// Store implementation
const useMessageStore = create<MessageState>()((set) => ({
    messages: [],
    setMessages: (newMessages) => set({ messages: newMessages }),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    clearMessages: () => set({ messages: [] })
}));

export default useMessageStore;