import useCollectionsStore from '../stores/collectionsStore';
import { fetch_db_collections, start_create_collection, start_delete_collection } from "../api/api_database";
import { add_log } from './handlers_logs';



export const get_all_collections = async() => {
    const fetched_collections = await fetch_db_collections();
    return fetched_collections
};

export const refresh_collections = async () => {
    const setCollections = useCollectionsStore.getState().setCollections;
    const fetched_collections = await get_all_collections();
    setCollections(fetched_collections);
};

export const get_current_collection = () => {
    const currentCollection = useCollectionsStore.getState().current_collection;
    return currentCollection;
};



export const select_collection = (selected_collection: string) => {
    const setCurrentCollection = useCollectionsStore.getState().setCurrentCollection;
    setCurrentCollection(selected_collection);
    add_log("Current collection is: " + selected_collection);
};

export const create_collection = async (collection_name: string, embedding_function: string) => {
    const addCollection = useCollectionsStore.getState().addCollection;
    const collection = await start_create_collection(collection_name, embedding_function)
    addCollection(collection);
    add_log("Created collection: " + collection);
}

export const delete_collection = async(collection_name: string) => {
    const setCollections = useCollectionsStore.getState().setCollections;
    const deleted_collection = await start_delete_collection(collection_name);
    const all_collections = await get_all_collections();
    setCollections(all_collections);
    add_log("Deleted collection: " + deleted_collection)
};