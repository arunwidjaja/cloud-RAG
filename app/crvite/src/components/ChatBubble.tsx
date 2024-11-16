import { SRC_DL_ICON } from "../constants/constants";
import { start_file_download } from "../api/api";
import { Message } from "../types/types";
import { get_current_collection } from "../handlers/collection_handlers";
import React from 'react';

interface ChatBubbleProps {
    message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    return (
        <div 
            className={`${message.type} chat-bubble`} 
            style={{ whiteSpace: 'pre-wrap' }}
        >
            {message.text}
            {(message.type === 'context') && (
                <div className="download_context">
                    <img 
                        className="icon" 
                        src={SRC_DL_ICON} 
                        onClick={() => start_file_download([message.file], get_current_collection())}
                        alt="Download"
                        role="button"
                    />
                </div>
            )}
        </div>
    );
};