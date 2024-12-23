import React from 'react';
import { Message } from "../types/types";

import { useToast } from '@/hooks/use-toast';

// Icons
import { ClipboardList, RotateCw } from "lucide-react";
import { Skeleton } from './ui/skeleton';

interface ChatBubbleProps {
    message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
    const { toast } = useToast()
    const isLoading = !message.text;

    const handle_copy = () => {
        // Copies to clipboard and displays a toast message
        navigator.clipboard.writeText(message.text);
        toast({
            className: "text-text2 bg-text p-4",
            description: "Copied message!",
            duration: 1500
        })
    }
    const handle_regenerate = () => {
        // TODO: Implement this
        alert("This button is supposed to regenerate the response.")
    }

    return (
        <div
            className={`${message.type} rounded-lg p-2 m-1 w-11/12`}
            style={{ whiteSpace: 'pre-wrap' }}
        >
            {/* Conditionally render a skeleton while the message is loading */}
            {isLoading ? (
                <Skeleton className='w-full h-full rounded-lg p-2'></Skeleton>
            ) : (
                <>
                    {/* Renders the actual message and action buttons once the first message stream is received. */}
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
                </>
            )}
        </div>
    );
};