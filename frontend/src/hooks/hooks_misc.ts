// Stores
import useEmbeddingsStore from "@/stores/embeddingsStore";
import usePresetsStore from "@/stores/presetsStore";





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

