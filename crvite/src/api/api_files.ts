import { get_current_collection } from "@/handlers/collection_handlers";
import { current_user_id } from "./api_init";
import { FileData } from "@/types/types";

export const fetch_db_files_metadata = async (): Promise<FileData[]> => {
  const collection_name = get_current_collection();
  if (collection_name) {
    try {
      const query = [collection_name].map(collection => `collections=${encodeURIComponent(collection)}`).join('&');
      const url = `${import.meta.env.VITE_API_BASE_URL}/db_files_metadata?${query}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'uuid': current_user_id
        },
      });
      if (!response.ok) { throw new Error('Network error when fetching database files'); }
      else {
        const files = await response.json();
        return files;
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      return [];
    }
  }
  else {
    console.log("No collection is selected. Cancelling fetching files.");
    return [];
  }
}
export const fetch_uploads_metadata = async (is_attachment: boolean = false): Promise<FileData[]> => {
  try {
    const query = `is_attachment=${is_attachment}`
    const url = `${import.meta.env.VITE_API_BASE_URL}/uploads_metadata?${query}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
    });
    if (!response.ok) { throw new Error('Network error when fetching uploads'); }
    else {
      const files = await response.json();
      return files;
    }
  } catch (error) {
    console.error('Error fetching uploads: ', error);
    return [];
  }
}
export const start_upload = async (uploads: FormData, is_attachment: boolean = false): Promise<string[]> => {
  try {
    const query = `is_attachment=${is_attachment}`
    const url = `${import.meta.env.VITE_API_BASE_URL}/upload_documents?${query}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'uuid': current_user_id
      },
      body: uploads
    })
    if (!response.ok) { throw new Error('Network error when uploading files'); }
    else {
      const uploaded_files: string[] = await response.json();
      return uploaded_files
    }
  } catch (error) {
    console.error("Error uploading file: ", error);
    return []
  }
}
export const start_upload_deletion = async (upload_deletion_list: FileData[], is_attachment: boolean = false): Promise<string[]> => {
  if (!Array.isArray(upload_deletion_list) || upload_deletion_list.length === 0) {
    return ['No uploads were removed']
  }
  try {
    const hashes = upload_deletion_list.map(item => item.hash); // extract list of file hashes
    const query_hashes = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`); // generate query parameter for hashes
    const query_attachment = `is_attachment=${encodeURIComponent(is_attachment)}` // generate query parameter for is_attachment flag
    const query = [...query_hashes,query_attachment].join('&'); // generate final query parameter

    const url = `${import.meta.env.VITE_API_BASE_URL}/delete_uploads?${query}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
    });
    if (!response.ok) { throw new Error('Network error when deleting uploads'); }
    else {
      const deleted_uploads = await response.json();
      return deleted_uploads;
    }
  } catch (error) {
    console.error('An error occurred while deleting uploads: ', error);
    return [];
  }
}
export const start_file_download = async (file_download_list: FileData[], collection: string): Promise<string[]> => {
  if (!Array.isArray(file_download_list) || file_download_list.length === 0) {
    return ['No files were downloaded']
  }
  try {
    const hashes = file_download_list.map(item => item.hash);
    const query_collection = [collection].map(collection => `collection=${encodeURIComponent(collection)}`).join('&');
    const query_hashes = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const query = `${query_hashes}&${query_collection}`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/download_files?${query}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/zip, application/octet-stream',
        'uuid': current_user_id
      }
    });
    if (!response.ok) { throw new Error('Network error when downloading files'); }
    else {
      console.log('Raw response', response)
      const content_disp = response.headers.get('Content-Disposition');
      let file_name = 'download';
      if (content_disp) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(content_disp);
        if (matches != null && matches[1]) {
          file_name = matches[1].replace(/['"]/g, '');
        }
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = file_name;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(link.href);

      return [file_name];
    }
  } catch (error) {
    console.error('An error occurred while download files: ', error);
    return [];
  }
}
export const start_file_deletion = async (file_deletion_list: FileData[], collection: string): Promise<string[]> => {
  if (!Array.isArray(file_deletion_list) || file_deletion_list.length === 0) {
    return ['No files were deleted']
  }
  try {
    const hashes = file_deletion_list.map(item => item.hash);
    const query_collection = [collection].map(collection => `collection=${encodeURIComponent(collection)}`).join('&');
    const query_hashes = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const query = `${query_hashes}&${query_collection}`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/delete_files?${query}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
    });
    if (!response.ok) { throw new Error('Network error when deleting files'); }
    else {
      const deleted_files = await response.json();
      return deleted_files;
    }
  } catch (error) {
    console.error('An error while deleting files from the collection: ', error)
    return [];
  }
}