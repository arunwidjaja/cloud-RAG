import { Chat } from "@/types/types";

import useChatsStore from "@/stores/chatsStore";

export const use_chats = (): Chat[] => {
    const chats = useChatsStore((state) => state.chats);
    return chats
}