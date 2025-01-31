import useMessageStore from "../stores/messageStore";
import { Message } from "../types/types";

export function add_message(message: Message) {
    const addMessage = useMessageStore.getState().addMessage;
    addMessage(message);
};

export function update_message(updated_message: Message) {
    const updateMessage = useMessageStore.getState().updateMessage;
    updateMessage(updated_message)
}

export function set_messages(messages: Message[]) {
    const setMessages = useMessageStore.getState().setMessages;
    setMessages(messages);
};
