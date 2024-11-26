import { fetch_saved_chats, start_save_chat } from "@/api/api";
import { Chat } from "@/types/types";

import useChatsStore from "@/stores/chatsStore";
import { set_messages } from "./message_handlers";


export const update_chats = () => {
    const updateChats = useChatsStore.getState().updateChats;
    updateChats();
}

/**
 * Saves the current chats to disk.
 */
export const save_chats = async() => {
    const current_chats = useChatsStore.getState().chats;
    for (const chat of current_chats) {
        const success = await start_save_chat(chat);
        if(success){console.log(`Chat saved: ${chat.id}`)}
    }
}

export const set_chats = (chats: Chat[]) => {
    const setChats = useChatsStore.getState().setChats;
    return setChats(chats);
}

export const get_saved_chats = async(): Promise<Chat[]> => {
    const saved_chats = await fetch_saved_chats();

    for (const chat of saved_chats){
        console.log("Fetched chat: " + chat.id)
    }
    return saved_chats;
}

export const refresh_chats = async(): Promise<void> => {
    const chat_history = await get_saved_chats();
    set_chats(chat_history);
}

export const handle_select_chat = (selected_chat: Chat): void => {
    const messages = selected_chat.messages
    set_messages(messages)
}