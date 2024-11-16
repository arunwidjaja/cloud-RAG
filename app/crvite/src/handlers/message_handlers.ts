import useMessageStore from "../stores/messageStore";
import { Message } from "../types/types";

export const add_message = (message: Message) => {
    const addMessage = useMessageStore.getState().addMessage;
    addMessage(message);
};
