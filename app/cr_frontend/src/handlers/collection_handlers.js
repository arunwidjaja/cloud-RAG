import useCollectionsStore from '../stores/collectionsStore';
import { add_log } from './log_handlers';

export const choose_collection = (selected_collection) => {
    const setCurrentCollection = useCollectionsStore.getState().setCurrentCollection;
    setCurrentCollection(selected_collection);
    add_log("Current collection is: " + selected_collection);
};

export const create_collection = (new_collection) => {
    const addCollection = useCollectionsStore.getState().addCollection;
    // TODO: create a new database collection.
    addCollection(new_collection);
    add_log("Created collection: " + new_collection);
}