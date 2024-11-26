import useFilesStore from "../stores/filesStore";

import { fetch_db_files_metadata, fetch_uploads_metadata } from "../api/api";
import { FileData } from "../types/types";

export const refresh_files = async () => {
    const setFiles = useFilesStore.getState().setFiles;
    const fetched_files = await fetch_db_files_metadata();
    setFiles(fetched_files);
};

export const get_selected_files = () => {
    const selectedFiles = useFilesStore.getState().selected_files;
    return selectedFiles;
};
export const set_selected_files = (selected_files: FileData[]) => {
    const setSelectedFiles = useFilesStore.getState().setSelectedFiles;
    setSelectedFiles(selected_files);
};
export const add_selected_file = async (selected_file: FileData) => {
    const addSelectedFile = useFilesStore.getState().addSelectedFile;
    addSelectedFile(selected_file);
};
export const clear_selected_files = () => {
    const clearSelectedFiles = useFilesStore.getState().clearSelectedFiles;
    clearSelectedFiles();
};

// Uploads Functions

export const refresh_uploads = async () => {
    const setUploads = useFilesStore.getState().setUploads;
    const fetched_uploads = await fetch_uploads_metadata();
    setUploads(fetched_uploads);
};

export const set_selected_uploads = (selected_uploads: FileData[]) => {
    const setSelectedUploads = useFilesStore.getState().setSelectedUploads;
    setSelectedUploads(selected_uploads);
};
export const add_selected_upload = async (selected_upload: FileData) => {
    const addSelectedUpload = useFilesStore.getState().addSelectedUpload;
    addSelectedUpload(selected_upload);
};
export const clear_selected_uploads = () => {
    const clearSelectedUploads = useFilesStore.getState().clearSelectedUploads;
    clearSelectedUploads();
};

export const get_uploads = async () => {
    const uploads = useFilesStore.getState().uploads;
    return uploads;
}

// Unused function
export const clear_uploads = () => {
    const { setUploads } = useFilesStore.getState();
    setUploads([]);
};