
import { handle_select_chat, refresh_chats } from '@/handlers/chats_handlers';
import { Chat } from '@/types/types';

import { use_chats } from '@/hooks/hooks';
import { start_delete_chat } from '@/api/api';
import { add_log } from '@/handlers/log_handlers';
import { Trash2 } from 'lucide-react';

export const handle_delete_chat = async (chat_id: string) => {
    const success = await start_delete_chat(chat_id);
    if (success) {
        refresh_chats();
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

interface ChatPreviewProps {
    subject: string;
    chat: Chat;
}

export const ChatPreview = ({ subject, chat }: ChatPreviewProps) => {
    return (
        <div
            className='flex flex-row items-center hover:bg-highlight hover:text-text2 p-1 text-text text-sm rounded-md font-sans ml-3'>
            <Trash2
                className='text-warning w-6 h-6 mr-1 opacity-50 hover:cursor-pointer hover:opacity-100'
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
    )
};



