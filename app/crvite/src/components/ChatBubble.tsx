import { Message } from "../types/types";
import React from 'react';

import { ClipboardList, RefreshCcw } from "lucide-react";

interface ChatBubbleProps {
    message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const handle_copy = () => {
        navigator.clipboard.writeText(message.text);
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
                    <RefreshCcw
                        onClick={handle_copy}
                        className="opacity-50 hover:opacity-100 hover:cursor-pointer">
                    </RefreshCcw>
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