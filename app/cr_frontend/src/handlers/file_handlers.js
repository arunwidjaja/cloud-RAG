import useFilesStore from "../stores/filesStore";
import { fetch_db_files_metadata, fetch_uploads_metadata } from "../api/api";

// Files (in the database) Functions
export const refresh_files = async (collection_name) => {
    const setFiles = useFilesStore.getState().setFiles;
    const fetched_files = await fetch_db_files_metadata(collection_name);
    setFiles(fetched_files);
};
export const set_selected_files = (selected_files) => {
    const setSelectedFiles = useFilesStore.getState().setSelectedFiles;
    setSelectedFiles(selected_files);
};

export const add_selected_file = async (selected_file) => {
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
export const set_selected_uploads = (selected_uploads) => {
    const setSelectedUploads = useFilesStore.getState().setSelectedUploads;
    setSelectedUploads(selected_uploads);
};
export const add_selected_upload = async (selected_upload) => {
    const addSelectedUpload = useFilesStore.getState().addSelectedUpload;
    addSelectedUpload(selected_upload);
};
export const clear_selected_uploads = () => {
    const clearSelectedUploads = useFilesStore.getState().clearSelectedUploads;
    clearSelectedUploads();
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