import { create } from 'zustand';

const useCollectionsStore = create((set) => ({
    collections: [],
    selected_collections: [],
    current_collection: [],
    
    addCollection: (collection) => set((state) => ({collections: [...state.collections, collection]})),
    setCurrentCollection: (selected_collection) => set({current_collection: [selected_collection]}),
    clearSelectedCollections: () => set({selected_collections: []})
}));

export default useCollectionsStore;