import { ContextData } from "@/types/types";

// Stores
import useEmbeddingsStore from "@/stores/embeddingsStore";
import usePresetsStore from "@/stores/presetsStore";
import useRetrievedStore, { createDefaultContextData } from "@/stores/retrievedStore";





export const use_embeddings_store = (): string[] => {
    const presets = useEmbeddingsStore((state) => state.presets);
    return presets;
}
export const use_presets = (): string[] => {
    const presets = usePresetsStore((state) => state.presets);
    return presets;
}
export const use_selected_preset = ():  string => {
    const selected_preset = usePresetsStore((state) => state.selected_preset);
    return selected_preset;
}
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

