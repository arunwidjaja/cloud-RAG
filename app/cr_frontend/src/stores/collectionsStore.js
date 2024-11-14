import { create } from 'zustand';

import start_create_collection from '../api/api';

const useCollectionsStore = create((set) => ({
    collections: [],
    selected_collections: [],
    current_collection: [],
    
    setCollections: (newCollections) => set({ collections: newCollections }),
    addCollection: (collection) => set((state) => ({collections: [...state.collections, collection]})),
    setCurrentCollection: (selected_collection) => set({current_collection: [selected_collection]}),
    clearSelectedCollections: () => set({selected_collections: []})
}));

export default useCollectionsStore;