import useCollectionsStore from '../stores/collectionsStore';
import { refresh_files } from './file_handlers';
import { fetch_db_collections, start_create_collection } from "../api/api";
import { add_log } from './log_handlers';

// Refreshes the list of collections
export const refresh_collections = async () => {
    const setCollections = useCollectionsStore.getState().setCollections;
    const fetched_collections = await fetch_db_collections();
    setCollections(fetched_collections);
};

export const choose_collection = (selected_collection) => {
    const setCurrentCollection = useCollectionsStore.getState().setCurrentCollection;
    setCurrentCollection([selected_collection]);
    refresh_files([selected_collection]);
    add_log("Current collection is: " + selected_collection);
};

export const create_collection = async (collection_name, embedding_function) => {
    const addCollection = useCollectionsStore.getState().addCollection;
    const collection = await start_create_collection(collection_name, embedding_function)

    addCollection(collection);
    add_log("Created collection: " + collection);
}