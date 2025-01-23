
import { handle_select_chat, refresh_chats } from '@/handlers/handlers_chats';
import { Chat } from '@/types/types';

import { use_chats } from '@/hooks/hooks_user_data';
import { start_delete_chat } from '@/api/api_user_data';
import { add_log } from '@/handlers/handlers_logs';
import { MessageCirclePlus, Trash2 } from 'lucide-react';
import { set_messages } from '@/handlers/handlers_messages';

export const handle_delete_chat = async (chat_id: string) => {
    const deleted_chat = await start_delete_chat(chat_id);
    if (deleted_chat) {
        refresh_chats();
        start_new_chat();
        add_log("Deleted chat: " + deleted_chat)

    }
    else { add_log('Unable to delete chat') }
}

export const handle_download_chats = async (chat_history: Chat[]) => {
    const chat_string = JSON.stringify(chat_history, null, 2)
    const blob = new Blob([chat_string], { type: 'application/json ' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "chat_history";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

export const start_new_chat = () => {
    set_messages([]);
}

interface ChatPreviewProps {
    subject: string;
    chat: Chat;
}

export const ChatPreview = ({ subject, chat }: ChatPreviewProps) => {
    return (
        <div
            className={`
                flex flex-row items-center
                p-1 ml-3
                text-sm rounded-md font-sans font-bold
                text-text
                hover:bg-highlight hover:text-text2 
            `}>
            <Trash2
                className={`
                    flex-shrink-0
                    w-6 h-6 mr-1
                    text-warning 
                    opacity-50
                    hover:cursor-pointer
                    hover:opacity-100 
                `}
                onClick={() => handle_delete_chat(chat.id)}>
            </Trash2>
            <div
                onClick={() => handle_select_chat(chat)}
                className='min-w-0 truncate hover:cursor-pointer'>
                {subject}
            </div>
        </div>
    )
};

export const ChatHistory = () => {
    const chat_history = use_chats();
    return (
        <div className='flex-1'>
            <div
            onClick={start_new_chat}
            className={`
                flex flex-row items-center
                p-1 mr-1 ml-3 mb-4
                text-highlight rounded-md 
                hover:bg-highlight
                hover:cursor-pointer
                hover:text-text2
            `}>
                <MessageCirclePlus
                    className='hover:cursor-pointer'>
                </MessageCirclePlus>
                <p
                    className='ml-2 text-sm hover:cursor-pointer hover:font-bold'>
                    Start New Chat
                </p>
            </div>
            <div className='ml-5 mb-1 font-serif font-bold text-text'>
                Recent Chats
            </div>
            <div id="chathistory" className="flex-1 min-h-0 w-full mb-2">
                <div className={`
                        flex flex-col
                        h-full
                        overflow-y-auto
                        [&::-webkit-scrollbar]:hidden
                        [-ms-overflow-style:none]
                        [scrollbar-width:none]
                    `}>
                    <div
                        className={`
                            overflow-auto
                            mr-1
                            whitespace-nowrap
                            [&::-webkit-scrollbar]:h-1.5
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-accent
                            [&::-webkit-scrollbar-thumb]:rounded-full
                        `}>
                        {chat_history.map((chat, index) => (
                            <ChatPreview
                                key={index}
                                subject={chat.subject}
                                chat={chat}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};



