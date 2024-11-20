import useRetrievedStore from "@/stores/retrievedStore";
import { ContextData } from "@/types/types";

export const set_retrieved_files = (retrieved_files: ContextData[]) => {
    const setRetrieved = useRetrievedStore.getState().setRetrieved;
    setRetrieved(retrieved_files);
}

export const use_retrieved_files = (): ContextData[] => {
    const retrieved = useRetrievedStore((state) => state.retrieved);
    console.log(retrieved)
    return retrieved;
}

export const handle_select_retrieved = (retrieved_context: string): void => {
    // alert(retrieved_context.context)
    alert(retrieved_context)
}