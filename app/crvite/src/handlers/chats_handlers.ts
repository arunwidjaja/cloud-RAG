import { fetch_saved_chats, start_save_chat } from "@/api/api";
import { createChat, useChatsStore } from "@/stores/chatsStore";
import { add_log } from "./log_handlers";
import { Chat } from "@/types/types";

export const use_chats = () => {
    const chats = useChatsStore((state) => state.chats);
    return chats
}

export const save_chat = async() => {
    const chat = createChat();
    const success = await start_save_chat(chat);
    if(success){add_log("Chat saved.")}
}

export const set_chats = (chats: Chat[]) => {
    const setChats = useChatsStore.getState().setChats;
    return setChats(chats);
}

export const get_saved_chats = async() => {
    const saved_chats = await fetch_saved_chats();

    for (const chat of saved_chats){
        for(const message of chat.messages){
            console.log(message.text)
        }
    }
    return saved_chats;
}