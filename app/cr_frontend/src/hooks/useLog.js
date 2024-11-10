// useLog.js
import { useState } from 'react';
import { fetch_db_files_metadata } from '../api/api';

export const useLog = () => {
    const [log_messages, set_log_messages] = useState([]);

    const write_to_log = (log_message) => {
        set_log_messages((prev_messages) => [...prev_messages, { text: log_message }]);
    };

    return {
        log_messages,
        write_to_log,
    };
}