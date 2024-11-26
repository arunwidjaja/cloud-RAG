import useMessageStore from "@/stores/messageStore"
import { Message } from "@/types/types";
import { ChatBubble } from "./ChatBubble";
import { useEffect } from "react";
import { save_chats, update_chats } from "@/handlers/chats_handlers";

export function Conversation() {
    const { messages } = useMessageStore();

    useEffect(() => {
        const handle_conversation_update = async () => {
            try {
                update_chats();
                await save_chats();
            } catch (error) {
                console.error('Error updating chats: ', error)
            }
        };
        handle_conversation_update();
    }, [messages]);

    return (
        <div
            id="conversation"
            className="border border-red-500 flex flex-1 flex-col-reverse text-text bg-none output p-2 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full">

            {messages.map((msg: Message, index: number) => (<ChatBubble key={index} message={msg} />))}
        </div>
    )
}