import { forwardRef, useRef, ChangeEvent, ForwardedRef } from "react";
import { refresh_uploads } from "../handlers/file_handlers";
import { add_log } from "../handlers/log_handlers";
import React from 'react';

type FileUploadWindowProps = {
    // Add any props if needed
};

export const FileUploadWindow = forwardRef<HTMLInputElement, FileUploadWindowProps>((
    _,
    forwardedRef: ForwardedRef<HTMLInputElement>
) => {
    const internalRef = useRef<HTMLInputElement>(null);
    // Convert the forwarded ref to a RefObject if it's a function
    const upload_window = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

    const accept_uploads = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append('files', files[i]);
            }

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload_documents`, {
                    method: 'POST',
                    body: formData
                });

                const uploaded_files: string[] = await response.json();
                uploaded_files.forEach((uploaded_file) => {
                    add_log("Uploaded File: " + uploaded_file);
                });

                if (upload_window.current) {
                    upload_window.current.value = '';
                }
            } catch (error) {
                console.error('Error uploading files:', error);
            }
        }
        refresh_uploads();
    };

    return (
        <input
            type="file"
            ref={forwardedRef}  // Use the original forwardedRef here
            onChange={accept_uploads}
            style={{ display: 'none' }}
            multiple
        />
    );
});

FileUploadWindow.displayName = 'FileUploadWindow';