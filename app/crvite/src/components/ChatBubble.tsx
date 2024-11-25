import { Message } from "../types/types";
import React from 'react';

import { ICON_COPY, ICON_RETRY } from "../constants/constants";

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
                    <div className={`${message.type}-icon rounded-md`}>
                        <img
                            src={ICON_COPY}
                            className={`w-6 h-6 hover:cursor-pointer`}
                            onClick={handle_copy}>
                        </img>
                    </div>
                    <div className={`${message.type}-icon rounded-md`}>
                        <img
                            src={ICON_RETRY}
                            className={`w-6 h-6 hover:cursor-pointer`}
                            onClick={handle_copy}>
                        </img>
                    </div>
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