import useCollectionsStore from "@/stores/collectionsStore";

export const use_current_collection = (): string => {
    const currentCollection = useCollectionsStore((state) => state.current_collection);
    return currentCollection;
};
export const use_collections = (): string[] => {
    const allCollections = useCollectionsStore((state) => state.collections);
    return allCollections;
};