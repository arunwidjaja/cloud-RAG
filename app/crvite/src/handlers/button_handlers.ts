import {
  refresh_files,
  refresh_uploads,
  get_selected_files,
  get_uploads
} from '../handlers/file_handlers';
import { add_log } from '../handlers/log_handlers';
import { select_collection, create_collection, delete_collection, get_all_collections, get_current_collection } from './collection_handlers';
import useCollectionsStore from '../stores/collectionsStore';
import {
  start_file_deletion,
  start_file_download,
  start_push_to_DB,
  start_upload_deletion
} from '../api/api';
import { FileData } from "../types/types";
import { RefObject } from 'react';



// Accepts user uploads
export const handle_accept_uploads = (uploadRef: RefObject<HTMLInputElement>): void => {
  if (uploadRef && uploadRef.current) { uploadRef.current.click(); }
};

// Removes selected uploads from the upload list
export const handle_remove_selected_uploads = async (uploads_to_remove: FileData[]) => {
  const removed_uploads = await start_upload_deletion(uploads_to_remove);
  refresh_uploads();
  
  removed_uploads.forEach(element => {
    add_log("Removed upload: " + element)
  });
};

// Database Operation Buttons

// Downloads the selected files from the DB
export const handle_download_selected_files = async () => {
  const files_to_download = get_selected_files();
  const current_collection = get_current_collection();
  const downloaded_files = await start_file_download(files_to_download, current_collection);
  
  downloaded_files.forEach(element => {
    add_log("Downloaded file: " + element)
  });
};

// Pushes all uploads to the DB
export const handle_push_uploads = async () => {
  const current_collection = get_current_collection();
  const uploads = await get_uploads();
  if (uploads[0].hash){
    const pushed_uploads = await start_push_to_DB(uploads, current_collection);
    refresh_files();
    refresh_uploads();
    
    pushed_uploads.forEach(element => {
      add_log("Pushed upload: " + element)
    });
  }
  else {
    add_log("Upload files first")
  }
};

// Deletes the selected files from the DB
export const handle_delete_selected_files = async () => {
  const files_to_delete = get_selected_files();
  const current_collection = get_current_collection();
  const delete_files = await start_file_deletion(files_to_delete, current_collection)
  refresh_files();
  
  delete_files.forEach(element => {
    add_log("Deleted file from DB: " + element)
  });
};

// Creates a new collection
export const handle_create_collection = async (collection_name: string, embedding_function: string) => {
  const collections = useCollectionsStore.getState().collections;
  if (!collection_name) {
    alert("Collection name is required.");
    return;
  }
  if(!embedding_function) {
    alert("An embedding function is required.")
    return;
  }
  if (collections.includes(collection_name)){
    alert("This collection already exists. Please choose a unique name.")
    return;
  }
  create_collection(collection_name, embedding_function)
};

// Deletes a collection
export const handle_delete_collection = async() => {
  const current_collection = get_current_collection();
  delete_collection(current_collection)
  const all_collections = await get_all_collections();
  select_collection(all_collections[0])
};

// Chooses a collection from the drop down menu
export const handle_choose_collection = (selected_collection: string) => {
  select_collection(selected_collection);
  refresh_files();
};

