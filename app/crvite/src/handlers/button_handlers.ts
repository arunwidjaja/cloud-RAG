import {
  refresh_files,
  refresh_uploads,
  get_selected_files,
  clear_all_selections
} from '../handlers/file_handlers';
import { add_log } from '../handlers/log_handlers';
import { choose_collection, create_collection, delete_collection, get_all_collections, get_current_collection } from './collection_handlers';
import useCollectionsStore from '../stores/collectionsStore';
import {
  start_file_deletion,
  start_file_download,
  start_push_to_DB,
  start_upload_deletion
} from '../api/api';
import { FileData } from "../types/types";
import { RefObject } from 'react';
import { EF } from '../constants/constants';


// Accepts user uploads
export const handle_accept_uploads = (uploadRef: RefObject<HTMLInputElement>): void => {
  if (uploadRef && uploadRef.current) { uploadRef.current.click(); }
};

// Removes selected uploads from the upload list
export const handle_remove_selected_uploads = async (uploads_to_remove: FileData[]) => {
  const removed_uploads = await start_upload_deletion(uploads_to_remove);
  refresh_uploads();
  clear_all_selections();
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
  clear_all_selections();
  downloaded_files.forEach(element => {
    add_log("Downloaded file: " + element)
  });
};

// Pushes all uploads to the DB
export const handle_push_uploads = async (uploads: FileData[]) => {
  const current_collection = get_current_collection();
  const pushed_uploads = await start_push_to_DB(uploads, current_collection);
  refresh_files(current_collection);
  refresh_uploads();
  clear_all_selections();
  pushed_uploads.forEach(element => {
    add_log("Pushed upload: " + element)
  });
};

// Deletes the selected files from the DB
export const handle_delete_selected_files = async () => {
  const files_to_delete = get_selected_files();
  const current_collection = get_current_collection();
  const delete_files = await start_file_deletion(files_to_delete, current_collection)
  refresh_files(current_collection);
  clear_all_selections();
  delete_files.forEach(element => {
    add_log("Deleted file from DB: " + element)
  });
};

// Creates a new collection
export const handle_create_collection = async () => {
  const collections = useCollectionsStore.getState().collections;
  const collection_name = prompt("Enter a collection name");

  if (!collection_name) {
    alert("Collection name is required.");
    return;
  }
  if (collections.includes(collection_name)){
    alert("This collection already exists. Please choose a unique name.")
    return;
  }

  const select_embedding_function = 'openai'
  create_collection(collection_name, select_embedding_function)
};

// Deletes a collection
export const handle_delete_collection = async() => {
  const current_collection = get_current_collection();
  delete_collection(current_collection)
  const all_collections = await get_all_collections();
  choose_collection(all_collections[0])
};

// Chooses a collection from the drop down menu
export const handle_choose_collection = (selected_collection: string) => {
  choose_collection(selected_collection);
  clear_all_selections();
  refresh_files([selected_collection]);
};