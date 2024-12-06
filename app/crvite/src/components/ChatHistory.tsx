import { Button } from './ui/button';

import { ICON_CHAT } from '@/constants/constants';
import { handle_select_chat, refresh_chats } from '@/handlers/chats_handlers';
import { Chat } from '@/types/types';

import { use_chats } from '@/hooks/hooks';
import { start_delete_chats } from '@/api/api';
import { add_log } from '@/handlers/log_handlers';

export const handle_delete_chats = async () => {
    const success = await start_delete_chats();
    if (success) {
        refresh_chats();
        add_log("Deleted chat history")
    }
    else { add_log('Unable to delete chats') }
}

interface ChatPreviewProps {
    subject: string;
    chat: Chat;
}

export const ChatPreview = ({ subject, chat }: ChatPreviewProps) => {
    return (
        <div
            className='flex flex-row items-center hover:bg-highlight hover:text-text2 hover:cursor-pointer p-1 text-text text-sm rounded-md font-sans ml-3'
            onClick={() => handle_select_chat(chat)}>
            <img src={ICON_CHAT} className='w-6 h-6 mr-1'></img>
            <div className='min-w-0 truncate'>
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
                <Button
                    className='flex m-2'
                    variant='destructive'
                    onClick={handle_delete_chats}>Erase Chat History</Button>
            </div>
        </div>
    )
};



