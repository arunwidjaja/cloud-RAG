import { create } from 'zustand';
import { FileData } from '../types/types';

// Base Message interface with common properties
interface BaseMessage {
    type: string;
    text: string;
    file?: FileData
}

// Specific message types
interface InputMessage extends BaseMessage {
    type: 'input';
    text: string;
}

interface AnswerMessage extends BaseMessage {
    type: 'answer';
    text: string;
}

interface ContextMessage extends BaseMessage {
    type: 'context';
    file: FileData;
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

export const createContextMessage = (
    file: FileData
): ContextMessage => ({
    type: 'context',
    text: file.name,
    file
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