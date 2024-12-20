import React, { useState, useRef, useEffect } from 'react';
import { start_submit_query, start_stream_query } from '../api/api';

// Handlers
import { add_message, update_message } from '../handlers/message_handlers';
import { set_current_retrieved, set_retrieved_files } from '@/handlers/retrieved_handlers';

// Stores
import { createAnswerMessage, createInputMessage } from '../stores/messageStore';
import { get_current_chat } from '@/handlers/chats_handlers';

import { ContextData } from '@/types/types';

export const TextInput = () => {
    const [user_input, set_user_input] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const streamingMessageRef = useRef<string>("");
    


    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            const newHeight = Math.min(textAreaRef.current.scrollHeight, 200);
            textAreaRef.current.style.height = `${newHeight}px`;
        }
    }, [user_input]);

    const handle_key_down = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // send_user_input();
            handle_streaming_response();
        }
    }

    const handle_streaming_response = async (): Promise<void> => {
        setIsStreaming(true);
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
        }
    }

    const send_user_input = async () => {
        if (user_input.trim()) {
            const input_message = createInputMessage(user_input)
            const current_chat = get_current_chat();

            add_message(input_message);
            set_user_input('')

            const ai_reply = await start_submit_query(user_input, current_chat, 'question');

            const ai_reply_text: string = ai_reply.text; // The Answer
            const ai_reply_context: ContextData[] = ai_reply.context_list; // The LIST of contexts used


            let sources_string = '\n\nSources used: ';
            for (const context of ai_reply_context) {
                sources_string = sources_string + '\n' + context.file.name;
            }

            const answer_message = ai_reply_text + sources_string
            add_message(createAnswerMessage(answer_message))

            set_retrieved_files(ai_reply_context);
            set_current_retrieved(ai_reply_context[0]);
        }
    };

    return (
        <div className='mt-2 flex flex-row justify-center'>
            <textarea
                id='userinput'
                ref={textAreaRef}
                value={user_input}
                onChange={(e) => set_user_input(e.target.value)}
                onKeyDown={handle_key_down}
                disabled={isStreaming}
                className="w-3/4 text-text bg-accent p-4 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
            />
        </div>
    )
};















