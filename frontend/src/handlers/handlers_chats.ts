import { fetch_saved_chats, start_save_chat } from "@/api/api_user_data";
import { Chat } from "@/types/types";

import useChatsStore from "@/stores/chatsStore";
import { set_messages } from "./handlers_messages";


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
        const saved_chat = await start_save_chat(chat);
        if(saved_chat){console.log(`Chat saved: ${saved_chat}`)}
    }
}

export const set_chats = (chats: Chat[]) => {
    const setChats = useChatsStore.getState().setChats;
    return setChats(chats);
}

export const get_current_chat = (): Chat => {
    const current_chat = useChatsStore.getState().getCurrentChat();
    return current_chat;
}

export const get_saved_chats = async(): Promise<Chat[]> => {
    const saved_chats_reverse = await fetch_saved_chats();
    // The chats' order needs to be reversed, because:
    // The chat history component should show newest chats at the TOP.
    const saved_chats = saved_chats_reverse.reverse();
    for (const chat of saved_chats){
        console.log("Fetched chat: " + chat.id)
    }
    return saved_chats;
}

/**
 * Resets the chat history to whatever is saved
 */
export const refresh_chats = async(): Promise<void> => {
    const chat_history = await get_saved_chats();
    set_chats(chat_history);
}

export const handle_select_chat = (selected_chat: Chat): void => {
    const messages = selected_chat.messages
    set_messages(messages)
}