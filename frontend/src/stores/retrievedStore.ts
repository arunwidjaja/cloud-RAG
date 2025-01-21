import { FileData } from "@/types/types";
import { create } from "zustand";
import { createDefaultFileData } from "./filesStore";

interface ContextData {
    text: string;
    file: FileData;
}

interface RetrievedState {
    retrieved: ContextData[];
    current_retrieved: ContextData;
    selected_page: number;

    setRetrieved: (retrieved: ContextData[]) => void;
    setCurrentRetrieved: (currentRetrieved: ContextData) => void;
    setSelectedPage: (newPage: number) => void;
}

export const createContextData = (file: FileData, text: string): ContextData => ({
    file,
    text
});

export const createDefaultContextData = (): ContextData => ({
    text: "No documents have been retrieved yet.",
    file: createDefaultFileData()
})



const useRetrievedStore = create<RetrievedState>()((set) => ({
    retrieved: [],
    current_retrieved: createDefaultContextData(),
    selected_page: 1,
    setCurrentRetrieved: (newCurrentRetrieved: ContextData) => set({current_retrieved: newCurrentRetrieved}),
    setRetrieved: (newRetrieved: ContextData[]) => set({retrieved: newRetrieved}),
    setSelectedPage: (newPage) => {
        set({ selected_page: newPage })
      }
}));

export default useRetrievedStore