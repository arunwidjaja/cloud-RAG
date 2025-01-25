// Types
import { ContextData, ContextMessage, Message } from "../types/types";

// Hooks
import { useToast } from '@/hooks/use-toast';

// Components
import { ClipboardList, PencilLine, Search } from "lucide-react";
import { Skeleton } from './ui/skeleton';
import { set_current_context } from "@/handlers/handlers_retrieval";

interface ContextProps {
    ctxs: ContextData[];
}

interface ChatBubbleProps {
    message: Message;
    onEditMessage: (text: string) => void;
}

const Contexts = ({ ctxs }: ContextProps) => {
    function click_context(ctx: ContextData) {
        set_current_context(ctx)
        console.log("Selected context on page " + ctx.page + ":")
        console.log(ctx.text)
    }
    return (
        <div>
            {ctxs.map((ctx, index) => {
                const ctx_str = `${ctx.file.name}, Page ${Number(ctx.page) + 1}`;
                return (
                    <div
                        key={`${ctx.file.hash}-${ctx.page}-${index}`}
                        className={`
                            flex flex-row items-center
                            m-2 rounded-lg
                            cursor-pointer
                            text-sm
                            text-text2
                            border border-text2
                            hover:bg-text
                            hover:text-text2
                            hover:text-bold
                        `}
                        onClick={() => click_context(ctx)}
                    >
                        <Search className="m-2 p-0.5 shrink-0" />
                        {ctx_str}
                    </div>
                );
            })}
        </div>
    )
}


export const ChatBubble = ({ message, onEditMessage }: ChatBubbleProps) => {
    const { toast } = useToast()
    const isLoading = !message.text;
    const isContext = isContextMsg(message)
    let content: ContextData[] = [];

    if (isContext) { content = message.content }

    function isContextMsg(message: Message): message is ContextMessage {
        return (message as ContextMessage).content !== undefined;
    }

    const handle_copy = () => {
        // Copies to clipboard and displays a toast message
        navigator.clipboard.writeText(message.text);
        toast({
            className: "text-text2 bg-text p-4",
            description: "Copied message!",
            duration: 1500
        })
    }

    const handle_click_edit = (message: string) => {
        onEditMessage(message)
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
                    <Contexts
                        ctxs={content}
                    >
                    </Contexts>
                    <div id="message_functions" className={`${message.type}-icon-container mt-1`}>
                        <div className="flex flex-row items-center">
                            {message.type != 'context' && (
                                <ClipboardList
                                    onClick={handle_copy}
                                    className="opacity-50 hover:opacity-100 hover:cursor-pointer">
                                </ClipboardList>
                            )}

                            {/* Conditionally render the edit message button */}
                            {message.type === 'input' && (
                                <PencilLine
                                    onClick={() => handle_click_edit(message.text)}
                                    className="opacity-50 hover:opacity-100 hover:cursor-pointer">
                                </PencilLine>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};