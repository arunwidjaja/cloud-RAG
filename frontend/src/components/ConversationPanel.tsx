import { useState } from "react";
import { Conversation } from "./Conversation";
import { UserInput } from "./UserInput";

export function ConversationPanel() {
    const [edited_query, set_edited_query] = useState('')
    const [edit_timestamp, set_edit_timestamp] = useState(0);

    const handle_edit_message = (message: string) => {
        set_edited_query(message)
        set_edit_timestamp(Date.now())
    }
    return (
        <div
            id="conversationarea"
            className={`
            flex flex-col flex-1
            p-3
    `}>
            <div className="relative">
                <div className="max-h-24 overflow-hidden">
                    <div
                        className={`
                    absolute top-0 bottom-0 left-0 right-0
                    h-24
                    bg-gradient-to-t from-transparent to-primary from-0 to-80%
            `}></div>
                </div>
            </div>
            <div className="flex flex-col h-full max-h-full">
                <Conversation
                    onEditQuery={handle_edit_message}>
                </Conversation>
                <UserInput
                    edited_query={edited_query}
                    edit_timestamp={edit_timestamp}>
                </UserInput>
            </div>
        </div>
    )
}