export interface FileData {
    hash: string;
    name: string;
    collection: string;
    word_count: number;
}

export interface ContextData {
    file: FileData;
    text: string;
}


// Base Message interface with common properties
export interface BaseMessage {
    id: string;
    text: string;
}

// InputMessage is for user inputs
export interface InputMessage extends BaseMessage {
    type: string;
}

// AnswerMessage is for any responses not containing context information
export interface AnswerMessage extends BaseMessage {
    type: string;
}

// ContextMessage is for RAG responses with associated context information
export interface ContextMessage extends BaseMessage {
    type: string;
    context_list: ContextData[];
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
    email: string;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    delete_account: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}