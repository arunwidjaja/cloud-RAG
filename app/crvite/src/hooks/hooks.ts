import useChatsStore from "@/stores/chatsStore";
import useCollectionsStore from "@/stores/collectionsStore";
import useEmbeddingsStore from "@/stores/embeddingsStore";
import useFilesStore from "@/stores/filesStore";
import usePresetsStore from "@/stores/presetsStore";
import useRetrievedStore from "@/stores/retrievedStore";

import { Chat, ContextData, FileData } from "@/types/types";

export const use_chats = (): Chat[] => {
    const chats = useChatsStore((state) => state.chats);
    return chats
}
export const use_current_collection = (): string => {
    const currentCollection = useCollectionsStore((state) => state.current_collection);
    return currentCollection;
};
export const use_collections = (): string[] => {
    const allCollections = useCollectionsStore((state) => state.collections);
    return allCollections;
};
export const use_embeddings_store = (): string[] => {
    const presets = useEmbeddingsStore((state) => state.presets);
    return presets;
}
export const use_files = (): FileData[] => {
    const files = useFilesStore((state) => state.files);
    return files;
}
export const use_selected_files = (): FileData[]=> {
    const currentSelectedFiles = useFilesStore((state) => state.selected_files);
    return currentSelectedFiles;
}
export const use_current_uploads = (): FileData[] => {
    const currentUploads = useFilesStore((state) => state.uploads);
    return currentUploads
}
export const use_selected_uploads = (): FileData[] => {
    const selectedUploads = useFilesStore((state) => state.selected_uploads);
    return selectedUploads
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
    return current_retrieved;
}

