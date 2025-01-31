import useFilesStore from "../stores/filesStore";

import { fetch_db_files_metadata, fetch_uploads_metadata } from "../api/api_files";
import { FileData } from "../types/types";

export async function refresh_files(): Promise<void> {
    const setFiles = useFilesStore.getState().setFiles;
    const fetched_files = await fetch_db_files_metadata();
    setFiles(fetched_files);
};

export function get_selected_files(): FileData[] {
    const selectedFiles = useFilesStore.getState().selected_files;
    return selectedFiles;
};
export function set_selected_files(selected_files: FileData[]): void {
    const setSelectedFiles = useFilesStore.getState().setSelectedFiles;
    setSelectedFiles(selected_files);
};
export function add_selected_file(selected_file: FileData): void {
    const addSelectedFile = useFilesStore.getState().addSelectedFile;
    addSelectedFile(selected_file);
};
export function clear_selected_files(): void {
    const clearSelectedFiles = useFilesStore.getState().clearSelectedFiles;
    clearSelectedFiles();
};

// Uploads Functions

export async function refresh_uploads(): Promise<void> {
    const setUploads = useFilesStore.getState().setUploads;
    const fetched_uploads = await fetch_uploads_metadata();
    setUploads(fetched_uploads);
};

export function set_selected_uploads(selected_uploads: FileData[]): void {
    const setSelectedUploads = useFilesStore.getState().setSelectedUploads;
    setSelectedUploads(selected_uploads);
};
export function add_selected_upload(selected_upload: FileData): void {
    const addSelectedUpload = useFilesStore.getState().addSelectedUpload;
    addSelectedUpload(selected_upload);
};
export function clear_selected_uploads(): void {
    const clearSelectedUploads = useFilesStore.getState().clearSelectedUploads;
    clearSelectedUploads();
};

export function get_uploads(): FileData[] {
    const uploads = useFilesStore.getState().uploads;
    return uploads;
}

export async function refresh_attachments(): Promise<void> {
    const setAttachments = useFilesStore.getState().setAttachments;
    const fetched_attachments = await fetch_uploads_metadata(true);
    for (const file of fetched_attachments) {
        console.log("Fetched attachment: " + file.name)
    }
    setAttachments(fetched_attachments);
}