import { create } from 'zustand';

// Define the structure of a file object
interface FileData {
  name: string;
  hash: string;
  word_count?: number;
}

interface FilesState {
  files: FileData[];
  uploads: FileData[];
  selected_files: FileData[];
  selected_uploads: FileData[];

  setFiles: (newFiles: FileData[]) => void;
  setUploads: (newUploads: FileData[]) => void;
  setSelectedFiles: (selectedFiles: FileData[]) => void;
  setSelectedUploads: (selectedUploads: FileData[]) => void;

  addSelectedFile: (selectedFile: FileData) => void;
  addSelectedUpload: (selectedUpload: FileData) => void;

  clearSelectedFiles: () => void;
  clearSelectedUploads: () => void;
}

export const createFileData = (name: string, hash: string): FileData => ({
  // will implement word count later
  word_count: 0,
  name,
  hash
});

const useFilesStore = create<FilesState>()((set) => ({
  files: [],
  uploads: [],
  selected_files: [],
  selected_uploads: [],

  setFiles: (newFiles) => set({ files: newFiles }),
  setUploads: (newUploads) => set({ uploads: newUploads }),
  setSelectedFiles: (selectedFiles) => set({ selected_files: selectedFiles }),
  setSelectedUploads: (selectedUploads) => set({ selected_uploads: selectedUploads }),

  addSelectedFile: (selectedFile) => set((state) => ({
    selected_files: [...state.selected_files, selectedFile]
  })),
  addSelectedUpload: (selectedUpload) => set((state) => ({
    selected_uploads: [...state.selected_uploads, selectedUpload]
  })),

  clearSelectedFiles: () => set({ selected_files: [] }),
  clearSelectedUploads: () => set({ selected_uploads: [] })
}));

export default useFilesStore;