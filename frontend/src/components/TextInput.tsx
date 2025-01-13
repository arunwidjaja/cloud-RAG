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

// Hooks
import { use_attachments } from '@/hooks/hooks_files';
import { refresh_attachments } from '@/handlers/file_handlers';
import { Attachment } from './Attachment';

const handle_accept_attachments = (attachmentRef: RefObject<HTMLInputElement>): void => {
    if (attachmentRef && attachmentRef.current) {
        attachmentRef.current.click();
    }
}

interface TextInputProps {
    edited_query: string;
    edit_timestamp: number;
}

export const TextInput = ({ edited_query, edit_timestamp }: TextInputProps) => {

    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const streamingMessageRef = useRef<string>("");
    const attachmentRef = useRef(null);

    const [user_input, set_user_input] = useState(""); // text in the text field
    const [isStreaming, setIsStreaming] = useState(false); // flag for checking if the response is still streaming

    const attachments = use_attachments()

    // Fetches the attachments on load
    useEffect(() => {
        refresh_attachments();
    }, []);


    // Resizes the text field and updates the user input vlaue when typing
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
                    id="attachments_section"
                    className={`
                        w-[90%]
                        rounded-tl-lg rounded-tr-lg
                        border
                        bg-text
                        text-text2
                        ${attachments.length > 0 ? "visible" : "hidden"}
                    `}>
                        {attachments.map((attachment, index)=>(
                            <Attachment
                                key={index}
                                file={attachment}
                            />
                        ))}
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















