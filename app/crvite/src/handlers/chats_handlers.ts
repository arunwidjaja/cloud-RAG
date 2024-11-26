import { start_save_chat } from "@/api/api";
import { createChat, useChatsStore } from "@/stores/chatsStore";
import { add_log } from "./log_handlers";

export const use_chats = () => {
    const chats = useChatsStore((state) => state.chats);
    return chats
}

export const save_chat = () => {
    const chat = createChat();
    start_save_chat(chat);
    add_log("Chat saved.")
}