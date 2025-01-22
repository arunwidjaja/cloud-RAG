import { ContextData } from "@/types/types";

// Stores
import useRetrievedStore, { createDefaultContextData } from "@/stores/retrievedStore";

export const use_retrieved_files = (): ContextData[] => {
    const retrieved = useRetrievedStore((state) => state.retrieved);
    return retrieved;
}
export const use_current_retrieved = (): ContextData => {
    const current_retrieved = useRetrievedStore((state) => state.current_retrieved);
    if(current_retrieved) {
        return current_retrieved;
    } else {
        return createDefaultContextData();
    }
}
export const use_current_page = (): number => {
    const currentPage = useRetrievedStore((state) => state.selected_page);
    return currentPage
}
