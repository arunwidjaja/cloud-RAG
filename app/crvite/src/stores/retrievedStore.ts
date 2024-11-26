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

    setRetrieved: (retrieved: ContextData[]) => void;
    setCurrentRetrieved: (currentRetrieved: ContextData) => void;
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
    setCurrentRetrieved: (newCurrentRetrieved: ContextData) => set({current_retrieved: newCurrentRetrieved}),
    setRetrieved: (newRetrieved: ContextData[]) => set({retrieved: newRetrieved})
}));

export default useRetrievedStore