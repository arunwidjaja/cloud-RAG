import { fetch_saved_chats, start_save_chat } from "@/api/api_user_data";
import { Chat } from "@/types/types";

import useChatsStore from "@/stores/chatsStore";
import { set_messages } from "./handlers_messages";


export function update_chats(): void{
    const updateChats = useChatsStore.getState().updateChats;
    updateChats();
}

export async function save_chats(): Promise<void> {
    const current_chats = useChatsStore.getState().chats;
    for (const chat of current_chats) {
        const saved_chat = await start_save_chat(chat);
        if(saved_chat){console.log(`Chat saved: ${saved_chat}`)}
    }
}

export function set_chats(chats: Chat[]): void {
    const setChats = useChatsStore.getState().setChats;
    return setChats(chats);
}

export function get_current_chat(): Chat {
    const current_chat = useChatsStore.getState().getCurrentChat();
    return current_chat;
}

export async function get_saved_chats(): Promise<Chat[]> {
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
export async function refresh_chats(): Promise<void> {
    const chat_history = await get_saved_chats();
    set_chats(chat_history);
}

export function handle_select_chat(selected_chat: Chat): void {
    const messages = selected_chat.messages
    set_messages(messages)
}