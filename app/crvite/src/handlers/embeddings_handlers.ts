import useEmbeddingsStore from "@/stores/embeddingsStore";


export const use_embeddings_store = () => {
    const presets = useEmbeddingsStore((state) => state.presets);
    return presets;
}