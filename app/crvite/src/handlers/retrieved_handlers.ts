import { start_file_download } from "@/api/api";
import useRetrievedStore from "@/stores/retrievedStore";
import { ContextData } from "@/types/types";
import { FileData } from "@/types/types";


export const set_retrieved_files = (retrieved_files: ContextData[]) => {
    const setRetrieved = useRetrievedStore.getState().setRetrieved;
    setRetrieved(retrieved_files);
}

export const set_current_retrieved = (current_retrieved: ContextData) => {
    const setCurrentRetrieved = useRetrievedStore.getState().setCurrentRetrieved;
    setCurrentRetrieved(current_retrieved)
}

// Files (in the database) Functions
export const get_file_data = (hash: string): FileData => {
    const retrieved_contexts = useRetrievedStore.getState().retrieved;
    console.log("Searching hash: " + hash)
    for (const retrieved_context of retrieved_contexts) {
        console.log("File: " + retrieved_context?.file.name + " Hash: " + retrieved_context?.file.hash)
    }
    const selected_context =  retrieved_contexts.find(context => context.file.hash === hash);
    if(!selected_context) {
        throw new Error(`No file found with hash ${hash}`)
    } else {
        return selected_context.file
    }
}

export const handle_select_retrieved = (retrieved_context: ContextData): void => {
    set_current_retrieved(retrieved_context)
}

export const handle_download_retrieved_file = (): void => {
    const current_retrieved = useRetrievedStore.getState().current_retrieved;
    const collection = current_retrieved.file.collection;
    start_file_download([current_retrieved.file], collection);
}