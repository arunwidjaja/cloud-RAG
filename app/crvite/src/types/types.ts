export interface FileData {
    name: string;
    hash: string;
    word_count?: number;
}

export interface ContextData {
    file: FileData;
    text: string;
}


// Base Message interface with common properties
export interface BaseMessage {
    type: string;
    text: string;
    context_list?: ContextData[]
}

// Specific message types
export interface InputMessage extends BaseMessage {
    type: 'input';
    text: string;
}

export interface AnswerMessage extends BaseMessage {
    type: 'answer';
    text: string;
}

export interface ContextMessage extends BaseMessage {
    type: 'context';
    text: string;
    context_list: ContextData[];
}

// Union type for all message types
export type Message = InputMessage | AnswerMessage | ContextMessage;