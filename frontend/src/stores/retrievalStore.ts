import { FileData } from "@/types/types";
import { create } from "zustand";

interface ContextData {
    file: FileData;
    page: string;
    text: string;
    
}

interface RetrievalState {
    retrieved_context: ContextData[];
    current_context: ContextData | null;

    setRetrievedContext: (retrieved: ContextData[]) => void;
    setCurrentContext: (currentRetrieved: ContextData) => void;
}

const useRetrievedStore = create<RetrievalState>()((set) => ({
    retrieved_context: [],
    current_context: null,
    setCurrentContext: (newCurrentRetrieved: ContextData) => set({ current_context: newCurrentRetrieved }),
    setRetrievedContext: (newRetrieved: ContextData[]) => set({ retrieved_context: newRetrieved }),
}));

export default useRetrievedStore