
import { handle_select_chat, refresh_chats } from '@/handlers/chats_handlers';
import { Chat } from '@/types/types';

import { use_chats } from '@/hooks/hooks';
import { start_delete_chat } from '@/api/api_user_data';
import { add_log } from '@/handlers/log_handlers';
import { MessageCirclePlus, Trash2 } from 'lucide-react';
import { set_messages } from '@/handlers/message_handlers';

export const handle_delete_chat = async (chat_id: string) => {
    const success = await start_delete_chat(chat_id);
    if (success) {
        refresh_chats();
        start_new_chat();
        add_log("Deleted chat: " + chat_id)

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
            className='flex flex-row items-center hover:bg-highlight hover:text-text2 p-1 text-text text-sm rounded-md font-sans ml-3'>
            <Trash2
                className='text-warning w-6 h-6 mr-1 opacity-50 hover:cursor-pointer hover:opacity-100 flex-shrink-0'
                onClick={() => handle_delete_chat(chat.id)}>
            </Trash2>
            <div
                onClick={() => handle_select_chat(chat)}
                className='min-w-0 truncate hover:cursor-pointer hover:font-bold'>
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
            className='mb-4 text-highlight flex flex-row items-center rounded-md mr-1 p-1 ml-3 hover:bg-highlight hover:cursor-pointer hover:text-text2'>
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
                <div className='flex flex-col h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                    <div
                        className='mr-1 overflow-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full'>
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



