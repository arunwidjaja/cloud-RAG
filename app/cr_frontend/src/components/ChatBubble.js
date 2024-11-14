import { SRC_DL_ICON } from "../constants/constants";
import { start_file_download } from "../api/api";



export const ChatBubble = ({ message }) => {
    return (
        <div className={`${message.type} chat-bubble`} style={{ whiteSpace: 'pre-wrap' }}>
            {message.text}
            {(message.type === 'conversation_context') && (
                <div className={`download_context`}>
                    <img className={`icon`} src={SRC_DL_ICON} onClick={() => start_file_download([message])} />
                </div>
            )}
        </div>
    )
};