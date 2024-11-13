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