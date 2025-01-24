import { ContextData, FileData } from "@/types/types";

// Stores
import useRetrievedStore from "@/stores/retrievalStore";

export const use_retrieved_context = (): ContextData[] => {
    const retrieved = useRetrievedStore((state) => state.retrieved_context);
    return retrieved;
}
export const use_retrieved_context_unique_files = (): FileData[] => {
    const retrieved = useRetrievedStore((state) => state.retrieved_context);
    const uniqueFileMap = new Map<string, FileData>();
    
    retrieved.forEach(context => {
        const { file } = context;
        if (!uniqueFileMap.has(file.hash)) {
            uniqueFileMap.set(file.hash, file);
        }
    });

    return Array.from(uniqueFileMap.values());
}
export const use_current_context = (): ContextData | null => {
    const current_retrieved = useRetrievedStore((state) => state.current_context);
    return current_retrieved
}
