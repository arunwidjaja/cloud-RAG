import React, { useState, useRef, useEffect } from 'react';
import { start_submit_query } from '../api/api';
import { add_message } from '../handlers/message_handlers';
import { createAnswerMessage, createContextMessage, createInputMessage } from '../stores/messageStore';
import { createFileData } from '../stores/filesStore';
import { set_retrieved_files } from '@/handlers/retrieved_handlers';

import { ContextData } from '@/types/types';

export const TextInput = () => {
    const [user_input, set_user_input] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
            send_user_input();
        }
    }
    const send_user_input = async () => {
        if (user_input.trim()) {
            const input_message = createInputMessage(user_input)
            add_message(input_message);
            set_user_input('')

            const ai_reply = await start_submit_query(user_input, 'question');

            const ai_reply_text: string = ai_reply.text; // The Answer
            const ai_reply_context: ContextData[] = ai_reply.context_list; // The LIST of contexts used


            let sources_string = '\n\nSources used: ';
            for(const context of ai_reply_context) {
                sources_string = sources_string + '\n' + context.file.name;
            }
            
            const answer_message = ai_reply_text + sources_string
            add_message(createAnswerMessage(answer_message))

            set_retrieved_files(ai_reply_context);
        }
    };

    return (
        <textarea
            id='userinput'
            ref={textAreaRef}
            value={user_input}
            onChange={(e) => set_user_input(e.target.value)}
            onKeyDown={handle_key_down}
            className="bg-[#18181B] p-4 rounded-lg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        />
    )
};















