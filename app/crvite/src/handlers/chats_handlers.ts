import { useChatsStore } from "@/stores/chatsStore";

export const use_chats = () => {
    const chats = useChatsStore((state) => state.chats);
    return chats
}