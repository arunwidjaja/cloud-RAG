import { use_chats } from '@/hooks/hooks';
import { ICON_CHAT } from '@/constants/constants';

interface ChatPreviewProps {
    subject: string;
}

export const ChatPreview = ({ subject }: ChatPreviewProps) => {
    return (
        <div className='flex flex-row items-center hover:bg-secondary hover:cursor-pointer p-1 text-text text-sm rounded-md font-sans ml-3'>
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
            <div className='h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
                <div className='mr-1 overflow-auto whitespace-nowrap [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full'>
                    {chat_history.map((chat, index) => (
                        <ChatPreview
                            key={index}
                            subject={chat.subject}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
};



