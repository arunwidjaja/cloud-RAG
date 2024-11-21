import { start_file_download } from "@/api/api";
import useCollectionsStore from "@/stores/collectionsStore";
import useRetrievedStore from "@/stores/retrievedStore";
import { ContextData } from "@/types/types";

export const set_retrieved_files = (retrieved_files: ContextData[]) => {
    const setRetrieved = useRetrievedStore.getState().setRetrieved;
    setRetrieved(retrieved_files);
}

export const set_current_retrieved = (current_retrieved: ContextData) => {
    const setCurrentRetrieved = useRetrievedStore.getState().setCurrentRetrieved;
    setCurrentRetrieved(current_retrieved)
}

export const use_retrieved_files = (): ContextData[] => {
    const retrieved = useRetrievedStore((state) => state.retrieved);
    console.log(retrieved)
    return retrieved;
}

export const use_current_retrieved = (): ContextData => {
    const current_retrieved = useRetrievedStore((state) => state.current_retrieved);
    return current_retrieved;
}

export const handle_select_retrieved = (retrieved_context: ContextData): void => {
    set_current_retrieved(retrieved_context)
}

export const handle_download_retrieved_file = (): void => {
    const current_retrieved = useRetrievedStore.getState().current_retrieved;
    const current_collection = useCollectionsStore.getState().current_collection;
    start_file_download([current_retrieved.file], current_collection);
}