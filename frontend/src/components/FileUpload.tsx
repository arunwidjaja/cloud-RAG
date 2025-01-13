import React from 'react';
import { forwardRef, useRef, ChangeEvent, ForwardedRef } from "react";

// Handlers
import { refresh_attachments, refresh_uploads } from "../handlers/file_handlers";
import { add_log } from "../handlers/log_handlers";

// API
import { start_upload } from "@/api/api_files";

// Hooks
import { use_current_collection } from '@/hooks/hooks_database';

type FileUploadWindowProps = {
    // Flag to differentiate between query attachments and files meant to be upload to DB
    is_attachment?: boolean;
};

export const FileUploadWindow = forwardRef<
    HTMLInputElement,
    FileUploadWindowProps
>((
    {
        is_attachment = false,
    },
    forwardedRef: ForwardedRef<HTMLInputElement>
) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const upload_window = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;
    let target_collection: string;

    if (is_attachment) {
        target_collection = "attachments";
    } else {
        target_collection = use_current_collection();
    }


    // Generates a temporary file ID for tracking file progress
    const generate_id = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const accept_uploads = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;

        // Checks if no files were uploaded.
        if (!files || files.length == 0) {
            alert('Please select at least one file');
            return;
        }
        // Enforces file extension
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert(`File ${file.name} is not a .pdf file`);
                event.target.value = '';
                return;
            }
        }
        // Adds files and metadata to FormData
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
            formData.append('file_ids', generate_id())
            formData.append('collection', target_collection)
        }
        try {
            const uploaded_files = await start_upload(formData, is_attachment);
            uploaded_files.forEach(
                (uploaded_file) => {
                    add_log(`${is_attachment ? "Attached" : "Uploaded"} File: ` + uploaded_file);
                }
            )

            // Resets the uploads after they are uploaded.
            if (upload_window.current) {
                upload_window.current.value = '';
            }
            if (!is_attachment) { refresh_uploads() };
            if (is_attachment) { refresh_attachments() };
        } catch (error) {
            console.error('Error upload files: ', error);
        }
    };

    return (
        <input
            type="file"
            ref={forwardedRef}
            onChange={accept_uploads}
            style={{ display: 'none' }}
            multiple
            accept=".pdf"
        />
    );
});

FileUploadWindow.displayName = 'FileUploadWindow';