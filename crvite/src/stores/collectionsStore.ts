import { create } from 'zustand';

interface CollectionsState {
    collections: string[];
    selected_collection: string;
    current_collection: string;

    setCollections: (newCollections: string[]) => void;
    addCollection: (collection: string) => void;
    setCurrentCollection: (selected_collection: string) => void;
    clearSelectedCollections: () => void;
}

const useCollectionsStore = create < CollectionsState > ()((set) => ({
    collections: [],
    selected_collection: '',
    current_collection: '',

    setCollections: (newCollections) => set({ collections: newCollections }),
    addCollection: (collection) => set((state) => ({
        collections: [...state.collections, collection]
    })),
    setCurrentCollection: (selected_collection) => set({
        current_collection: selected_collection
    }),
    clearSelectedCollections: () => set({ selected_collection: '' })
}));

export default useCollectionsStore;