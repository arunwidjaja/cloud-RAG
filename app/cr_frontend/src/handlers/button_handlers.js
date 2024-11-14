import {
  refresh_files,
  refresh_uploads,
  clear_all_selections
} from '../handlers/file_handlers';
import { add_log } from '../handlers/log_handlers.js';
import {
  start_file_deletion,
  start_file_download,
  start_push_to_DB,
  start_upload_deletion
} from '../api/api';
import useCollectionsStore from '../stores/collectionsStore.js';

import { EF } from '../constants/constants.js';
import { create_collection } from './collection_handlers.js';

// Accepts user uploads
export const handle_accept_uploads = async (uploadRef) => {
  if (uploadRef && uploadRef.current) { uploadRef.current.click(); }
};

// Pushes all uploads to the DB
export const handle_push_uploads = async (uploads) => {
  const pushed_uploads = await start_push_to_DB(uploads);
  refresh_files();
  refresh_uploads();
  clear_all_selections();
  pushed_uploads.forEach(element => {
    add_log("Pushed upload: " + element)
  });
};

// Removes selected uploads from the upload list
export const handle_remove_selected_uploads = async (uploads_to_remove) => {
  const removed_uploads = await start_upload_deletion(uploads_to_remove);
  refresh_uploads();
  clear_all_selections();
  removed_uploads.forEach(element => {
    add_log("Removed upload: " + element)
  });
};

// Downloads the selected files from the DB
export const handle_download_selected_files = async (files_to_download) => {
  const downloaded_files = await start_file_download(files_to_download);
  clear_all_selections();
  downloaded_files.forEach(element => {
    add_log("Downloaded file: " + element)
  });
};

// Deletes the selected files from the DB
export const handle_delete_selected_files = async (files_to_delete) => {
  const delete_files = await start_file_deletion(files_to_delete)
  refresh_files();
  clear_all_selections();
  delete_files.forEach(element => {
    add_log("Deleted file from DB: " + element)
  });
};

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

  const select_embedding_function = prompt(
    `Select an embedding function: ${EF.join(", ")}`
  );

  create_collection(collection_name, select_embedding_function)
};