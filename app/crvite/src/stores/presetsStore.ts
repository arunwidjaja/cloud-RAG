import { create } from "zustand";

interface PresetsState {
    presets: string[];
    selected_preset: string;
    setPresets: (presets: string[]) => void;
    setSelectedPreset: (selected_preset: string) => void;
}

const usePresetsStore = create<PresetsState>()((set) => ({
    presets: ['Summarize Documents','Analyze Sentiment','Extract Themes'],
    selected_preset: "",
    setPresets: (newPresets: string[]) => set({ presets: newPresets }),
    setSelectedPreset: (preset: string) => set({ selected_preset: preset}),

}));

export default usePresetsStore;