import { forwardRef, useRef, ChangeEvent, ForwardedRef } from "react";
import { refresh_uploads } from "../handlers/file_handlers";
import { add_log } from "../handlers/log_handlers";
import React from 'react';
import { start_upload } from "@/api/api";

type FileUploadWindow2Props = {
    // Add any props if needed
};

export const FileUploadWindow2 = forwardRef<HTMLInputElement, FileUploadWindow2Props>((
    _,
    forwardedRef: ForwardedRef<HTMLInputElement>
) => {
    const internalRef = useRef<HTMLInputElement>(null);
    // Convert the forwarded ref to a RefObject if it's a function
    const upload_window = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

    const accept_uploads = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        
        // Checks if files were uploaded.
        if(!files || files.length == 0) {
            alert('Please select at least one file');
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if(!file.name.toLowerCase().endsWith('.pdf')) {
                alert(`File ${file.name} is not a .pdf file`);
                event.target.value='';
                return;
            }
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const uploaded_files = await start_upload(formData);
            uploaded_files.forEach((uploaded_file) => {
                add_log("Uploaded File: " + uploaded_file);
            });

            if (upload_window.current) {
                upload_window.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading files:', error);
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
            accept=".pdf"
        />
    );
});

FileUploadWindow2.displayName = 'FileUploadWindow2';