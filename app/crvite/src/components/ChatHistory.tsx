import React from 'react';

import { use_chats } from '@/handlers/chats_handlers';
import { ICON_CHAT } from '@/constants/constants';


interface Chat {
    chat_headline: string;
}

export const ChatHistory= () => {
    const chats = use_chats();
    return (
        <div className='mr-1 overflow-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full'>
            {chats.map((chat, index) => (
                <Chat
                    key={index}
                    chat_headline={chat}
                />
            ))}
        </div>
    )
};

export const Chat: React.FC<Chat> = ({ chat_headline }) => {
    return (
        <div className='flex flex-row items-center hover:bg-secondary hover:cursor-pointer p-1 text-text text-sm rounded-md font-sans ml-3'>
            <img src={ICON_CHAT} className='w-6 h-6 mr-1'></img>
            <div className='min-w-0 truncate'>
            {chat_headline}
            </div>
            
        </div>
    )
};

