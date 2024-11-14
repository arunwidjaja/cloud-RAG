import { create } from 'zustand';

const useFilesStore = create((set) => ({
  files: [],
  uploads: [],
  selected_files: [],
  selected_uploads: [],

  setFiles: (newFiles) => set({ files: newFiles }),
  setUploads: (newUploads) => set({ uploads: newUploads }),
  setSelectedFiles: (selectedFiles) => set({ selected_files: selectedFiles }),
  setSelectedUploads: (selectedUploads) => set({ selected_uploads: selectedUploads }),

  addSelectedFile: (selectedFile) => set((state) => ({ selected_files: [...state.selected_files, selectedFile] })),
  addSelectedUpload: (selectedUpload) => set((state) => ({ selected_uploads: [...state.selected_uploads, selectedUpload] })),

  clearSelectedFiles: () => set({ selected_files: [] }),
  clearSelectedUploads: () => set({ selected_uploads: [] })
}));

export default useFilesStore;
