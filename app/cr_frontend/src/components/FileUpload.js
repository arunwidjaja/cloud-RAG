import { forwardRef, useRef } from "react";
import { refresh_uploads } from "../handlers/file_handlers";
import { add_log } from "../handlers/log_handlers";

export const FileUploadWindow = forwardRef((props, ref) => {

    const internalRef = useRef(null);
    const upload_window = ref || internalRef;

    const accept_uploads = async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/upload_documents`, {
                    method: 'POST',
                    body: formData
                });
                const uploaded_files = await response.json();
                uploaded_files.forEach((uploaded_file) => {
                    add_log("Uploaded File: " + uploaded_file)
                });
                upload_window.current.value = '';
            } catch (error) {
                console.error('Error uploading files:', error);
            }
        }
        refresh_uploads();
    }

    return (
        <input
            type="file"
            ref={upload_window}
            onChange={accept_uploads}
            style={{ display: 'none' }}
            multiple />
    )
});