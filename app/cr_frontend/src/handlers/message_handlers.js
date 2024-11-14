import useMessageStore from "../stores/messageStore";

export const add_message = (message) => {
    const addMessage = useMessageStore.getState().addMessage;
    addMessage(message);
};
