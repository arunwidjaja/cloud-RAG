export interface FileData {
    hash: string;
    name: string;
    collection: string;
    word_count?: number;
}

export interface ContextData {
    file: FileData;
    page: string;
    text: string;
}

// InputMessage is for user inputs
export interface InputMessage{
    id: string;
    type: string;
    text: string;
}

// AnswerMessage is for any responses not containing context information
export interface AnswerMessage {
    id: string;
    type: string;
    text: string;
}

// ContextMessage is for RAG responses with associated context information
export interface ContextMessage{
    id: string;
    type: string;
    text: string;
    content: ContextData[];
}

// Union type for all message types
export type Message = InputMessage | AnswerMessage | ContextMessage;

export interface Chat {
    id: string;
    subject: string;
    messages: Message[];
}

export interface ChatsState {
    chats: Chat[];
    addChat: (chat: Chat) => void;
}

export interface User {
    username: string;
    id: string;
}

export interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<boolean>;
    delete_account: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}