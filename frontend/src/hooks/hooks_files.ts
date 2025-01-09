import { FileData } from "@/types/types";

import useFilesStore from "@/stores/filesStore";

export const use_files = (): FileData[] => {
    const files = useFilesStore((state) => state.files);
    return files;
}
export const use_uploads = (): FileData[] => {
    const currentUploads = useFilesStore((state) => state.uploads);
    return currentUploads
}
export const use_attachments = (): FileData[] => {
    const attachments = useFilesStore((state) => state.attachments);
    return attachments;
}

export const use_selected_files = (): FileData[]=> {
    const currentSelectedFiles = useFilesStore((state) => state.selected_files);
    return currentSelectedFiles;
}
export const use_selected_uploads = (): FileData[] => {
    const selectedUploads = useFilesStore((state) => state.selected_uploads);
    return selectedUploads
}