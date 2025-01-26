import { start_file_download } from "@/api/api_files";
// import useFilesStore from "@/stores/filesStore";
import useRetrievedStore from "@/stores/retrievalStore";
import { ContextData } from "@/types/types";
// import { FileData } from "@/types/types";


export function set_retrieved_context(retrieved_files: ContextData[]): void {
    const setRetrievedContext = useRetrievedStore.getState().setRetrievedContext;
    setRetrievedContext(retrieved_files);
}

export function set_current_context(current_retrieved: ContextData): void {
    const setCurrentContext = useRetrievedStore.getState().setCurrentContext;
    setCurrentContext(current_retrieved)
}

export function handle_download_retrieved_file(): void {
    const current_context = useRetrievedStore.getState().current_context;
    const current_file = current_context?.file

    if(current_file){
        const collection = current_file.collection;
        start_file_download([current_file], collection);
    } 
}