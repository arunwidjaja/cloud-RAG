import { FileData } from "@/types/types";
import { create } from "zustand";

interface ContextData {
    file: FileData;
    text: string;
}

interface RetrievedState {
    retrieved: ContextData[];

    setRetrieved: (retrieved: ContextData[]) => void;
}

const useRetrievedState = create<RetrievedState>()((set) => ({
    retrieved: [],

    setRetrieved: (newRetrieved: ContextData[]) => set({retrieved: newRetrieved})
}));

export default useRetrievedState