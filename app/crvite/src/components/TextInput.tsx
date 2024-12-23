import React, { useState, useRef, useEffect } from 'react';
import { RefObject } from 'react';
import { start_stream_query } from '../api/api_llm_calls';
import { ContextData } from '@/types/types';

// Handlers
import { add_message, update_message } from '../handlers/message_handlers';
import { set_current_retrieved, set_retrieved_files } from '@/handlers/retrieved_handlers';

// Stores
import { createAnswerMessage, createInputMessage } from '../stores/messageStore';
import { get_current_chat, save_chats, update_chats } from '@/handlers/chats_handlers';

// Components
import { Paperclip } from 'lucide-react';
import { FileUploadWindow } from './FileUpload';

const handle_accept_attachments = (attachmentRef: RefObject<HTMLInputElement>): void => {
    if (attachmentRef && attachmentRef.current) { attachmentRef.current.click(); }
}

interface TextInputProps {
    edited_query: string;
    edit_timestamp: number;
}

export const TextInput = ({ edited_query, edit_timestamp }: TextInputProps) => {
    const [user_input, set_user_input] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const streamingMessageRef = useRef<string>("");

    const attachmentRef = useRef(null);

    // Resizes the text field when typing
    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            const newHeight = Math.min(textAreaRef.current.scrollHeight, 200);
            textAreaRef.current.style.height = `${newHeight}px`;
        }
    }, [user_input]);

    // Sets the text field content when the user edits a chat bubble.
    // The timestamp is included so that if the exact same message is edited twice, it still triggers
    useEffect(() => {
        if (edited_query) {
            set_user_input(edited_query)
            if (textAreaRef.current) {
                textAreaRef.current.focus();
            }
        }
    }, [edited_query, edit_timestamp]);

    // Sends input or adds a new line when hiting Enter vs Shift+Enter
    const handle_key_down = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handle_streaming_response();
        }
    }

    // Makes an API call and starts streaming the LLM response
    const handle_streaming_response = async (): Promise<void> => {
        setIsStreaming(true); // Flag to disable text field while response is streaming
        const input_message = createInputMessage(user_input);
        const current_chat = get_current_chat();
        streamingMessageRef.current = "";


        add_message(input_message);
        set_user_input('')

        // Create an initial empty answer message that will be updated
        const initial_answer_message = createAnswerMessage("");
        add_message(initial_answer_message);

        try {
            await start_stream_query(
                user_input,
                (chunk: string) => {
                    streamingMessageRef.current += chunk;
                    // Update the last message with the new content
                    const updated_message = createAnswerMessage(streamingMessageRef.current);
                    update_message(updated_message);
                },
                (metadata) => {
                    console.log('Received metadata: ', metadata);
                    const ai_reply_context: ContextData[] = metadata.contexts;

                    set_retrieved_files(ai_reply_context)
                    set_current_retrieved(ai_reply_context[0])
                },
                current_chat,
                'question'
            );
        } catch (error) {
            console.error('Streaming error:', error);
            // Handle error appropriately
            if (error instanceof Error) {
                const errorMessage = createAnswerMessage(`Error: ${error.message}`);
                add_message(errorMessage);
            }
        } finally {
            setIsStreaming(false);
            update_chats();
            save_chats();
        }
    }

    return (
        <div
            className={`
                flex flex-row justify-center
                mt-2
            `}>
            <div
                className={`
                    relative flex flex-col items-center
                    w-3/4
                `}>
                <div
                    className={`
                        grid grid-cols-3
                        w-[90%]
                        rounded-tl-lg rounded-tr-lg
                        border
                        text-white
                        border-green-800
                    `}>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                </div>
                <textarea
                    id='userinput'
                    ref={textAreaRef}
                    value={user_input}
                    onChange={(e) => set_user_input(e.target.value)}
                    onKeyDown={handle_key_down}
                    disabled={isStreaming}
                    className={`
                        w-full p-4 pr-8
                        rounded-lg
                        text-text bg-accent
                        [&::-webkit-scrollbar]:hidden
                        [-ms-overflow-style:'none']
                        [scrollbar-width:'none']
                `} />
                <div
                    className={`
                        flex-col
                        absolute right-0 bottom-0 justify-center
                    `}>
                    <FileUploadWindow
                        is_attachment={true}
                        ref={attachmentRef}>
                    </FileUploadWindow>
                    <Paperclip
                        onClick={() => handle_accept_attachments(attachmentRef)}
                        className={`
                            m-1
                            text-text opacity-50
                            hover:cursor-pointer
                            hover:opacity-100
                        `}>
                    </Paperclip>
                </div>
            </div>
        </div>
    )
};















