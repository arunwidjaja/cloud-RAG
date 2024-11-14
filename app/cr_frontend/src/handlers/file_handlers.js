import useFilesStore from "../stores/filesStore";
import { fetch_db_files_metadata, fetch_uploads_metadata } from "../api/api";

// Refreshes the list of files/uploads
export const refresh_files = async () => {
    const setFiles = useFilesStore.getState().setFiles;
    const fetched_files = await fetch_db_files_metadata();
    setFiles(fetched_files)
};
export const refresh_uploads = async () => {
    const setUploads = useFilesStore.getState().setUploads;
    const fetched_uploads = await fetch_uploads_metadata();
    setUploads(fetched_uploads);
}

// Adds a selected file/upload to the state
export const add_selected_file = async (selected_file) => {
    const addSelectedFile = useFilesStore.getState().addSelectedFile;
    addSelectedFile(selected_file);
};
export const add_selected_upload = async (selected_upload) => {
    const addSelectedUpload = useFilesStore.getState().addSelectedUpload;
    addSelectedUpload(selected_upload);
};

// Sets the list of selected files/uploads
export const set_selected_files = (selected_files) => {
    const setSelectedFiles = useFilesStore.getState().setSelectedFiles;
    setSelectedFiles(selected_files);
};
export const set_selected_uploads = (selected_uploads) => {
    const setSelectedUploads = useFilesStore.getState().setSelectedUploads;
    setSelectedUploads(selected_uploads);
};

// Unselects any selected files/uploads
export const clear_selected_uploads = () => {
    const clearSelectedUploads = useFilesStore.getState().clearSelectedUploads;
    clearSelectedUploads();
};
export const clear_selected_files = () => {
    const clearSelectedFiles = useFilesStore.getState().clearSelectedFiles;
    clearSelectedFiles();
};
export const clear_all_selections = () => {
    clear_selected_uploads();
    clear_selected_files();
}

// Unused function
export const clear_uploads = () => {
    const { setUploads } = useFilesStore.getState();
    setUploads([]);
};