import useMessageStore from "@/stores/messageStore"
import { Message } from "@/types/types";
import { ChatBubble } from "./ChatBubble";

export function Conversation({ onEditQuery }: { onEditQuery: (text: string) => void }) {
    const { messages } = useMessageStore();

    return (
        <div
            id="conversation"
            className={`
                flex flex-1 flex-col-reverse
                text-text bg-none output p-2
                overflow-y-auto
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-highlight
                [&::-webkit-scrollbar-thumb]:rounded-full
            `}>
            {messages.map((msg: Message, index: number) => (
                <ChatBubble
                    key={index}
                    message={msg}
                    onEditMessage={onEditQuery} />
            ))}
        </div>
    )
}