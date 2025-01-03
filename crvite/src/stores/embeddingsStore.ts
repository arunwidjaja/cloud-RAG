import { create } from "zustand";

interface EmbeddingsState {
    presets: string[];
}

const useEmbeddingsStore = create<EmbeddingsState>()((set) => ({
    presets: ['openai'],

    setPresets: (newPresets: string[]) => set({ presets: newPresets })

}));

export default useEmbeddingsStore;