import React, { useState, useRef, useEffect } from 'react';

export const TextInput = () => {
    const [user_input, set_user_input] = useState("");
    const textAreaRef = useRef(null);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'auto';
            const newHeight = Math.min(textAreaRef.current.scrollHeight, 200);
            textAreaRef.current.style.height = `${newHeight}px`;
        }
    }, [user_input]);

    const handle_key_down = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send_user_input();
        }
    }
    const send_user_input = async () => {
        if (user_input.trim()) {
            // add_bubble(user_input, 'INPUT');
            set_user_input('')

            // const ai_reply = await start_submit_query(user_input, 'question');
            // const ai_reply_text = ai_reply.message;
            // const ai_reply_context = ai_reply.contexts;
            // const ai_reply_id = ai_reply.id;
            // add_bubble(ai_reply_text, 'OUTPUT');

            // for (let i = 0; i < ai_reply_context.length; i++) {
            //     const context = ai_reply_context[i];
            //     add_bubble(context, 'CONTEXT');
            // }
        }
    };

    return (
        <textarea
            id='userinput'
            ref={textAreaRef}
            value={user_input}
            onChange={(e) => set_user_input(e.target.value)}
            onKeyDown={handle_key_down}
        />
    )
};











