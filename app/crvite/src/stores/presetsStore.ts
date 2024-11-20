import { create } from "zustand";

interface PresetsState {
    presets: string[];
}

const usePresetsStore = create<PresetsState>()((set) => ({
    presets: ['Summarize Documents','Analyze Sentiment','Extract Themes'],

    setPresets: (newPresets: string[]) => set({ presets: newPresets })

}));

export default usePresetsStore;