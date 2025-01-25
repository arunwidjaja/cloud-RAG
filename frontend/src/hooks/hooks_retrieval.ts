import { ContextData } from "@/types/types";

// Stores
import useRetrievedStore from "@/stores/retrievalStore";

export const use_retrieved_context = (): ContextData[] => {
    const retrieved = useRetrievedStore((state) => state.retrieved_context);
    return retrieved;
}
export const use_current_context = (): ContextData | null => {
    const current_retrieved = useRetrievedStore((state) => state.current_context);
    return current_retrieved
}
