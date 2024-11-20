import { FileData } from "@/types/types";
import { create } from "zustand";

interface ContextData {
    context: string;
    source: string;
    hash: string;
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