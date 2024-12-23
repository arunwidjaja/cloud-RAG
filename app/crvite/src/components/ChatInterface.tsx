import { useState } from "react";
import { Conversation } from "./Conversation";
import { TextInput } from "./TextInput";

export function ChatInterface() {
    const [edited_query, set_edited_query] = useState('')
    const [edit_timestamp, set_edit_timestamp] = useState(0);

    const handle_edit_message = (message: string) => {
        set_edited_query(message)
        set_edit_timestamp(Date.now())
    }
    return (
        <div className="flex flex-col h-full max-h-full">
            <Conversation
                onEditQuery={handle_edit_message}>
            </Conversation>
            <TextInput
                edited_query={edited_query}
                edit_timestamp={edit_timestamp}>
            </TextInput>
        </div>
    )
}