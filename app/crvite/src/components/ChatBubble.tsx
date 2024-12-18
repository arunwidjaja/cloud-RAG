import { Message } from "../types/types";
import React from 'react';

import { ClipboardList, RotateCw } from "lucide-react";

interface ChatBubbleProps {
    message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const handle_copy = () => {
        navigator.clipboard.writeText(message.text);
    }
    const handle_regenerate = () => {
        alert("This button is supposed to regenerate the response.")
    }
    return (
        <div
            className={`${message.type} chat-bubble`}
            style={{ whiteSpace: 'pre-wrap' }}
        >
            {message.text}
            <div id="message_functions" className={`${message.type}-icon-container mt-1`}>
                <div className="flex flex-row items-center">
                    <ClipboardList
                        onClick={handle_copy}
                        className="opacity-50 hover:opacity-100 hover:cursor-pointer">
                    </ClipboardList>
                    <RotateCw
                        onClick={handle_regenerate}
                        className="opacity-50 hover:opacity-100 hover:cursor-pointer">
                    </RotateCw>
                </div>
            </div>

            {/* {(message.type === 'context') && (
                <div className="download_context">
                    <img 
                        className="icon" 
                        src={SRC_DL_ICON} 
                        onClick={() => start_file_download([message.context_list[0].file], get_current_collection())}
                        alt="Download"
                        role="button"
                    />
                </div>
            )} */}
        </div>
    );
};