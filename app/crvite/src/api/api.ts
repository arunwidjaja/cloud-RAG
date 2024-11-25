import { get_current_collection } from '@/handlers/collection_handlers';
import { FileData } from '../types/types';
import { ContextMessage } from '../types/types';

export const fetch_db_collections = async (): Promise<string[]> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/collections`
    const response = await fetch(url);
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const collections = await response.json();
      return collections;
    }
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export const fetch_db_files_metadata = async (): Promise<FileData[]> => {
  const collection_name = get_current_collection();
  if (collection_name) {
    try {
      const query = [collection_name].map(collection => `collections=${encodeURIComponent(collection)}`).join('&');
      const url = `${import.meta.env.VITE_API_BASE_URL}/db_files_metadata?${query}`
      const response = await fetch(url);
      if (!response.ok) { throw new Error('Network response was not ok'); }
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
export const fetch_uploads_metadata = async (): Promise<FileData[]> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/uploads_metadata`
    const response = await fetch(url);
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const files = await response.json();
      return files;
    }
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return [];
  }
}
export const start_upload_deletion = async (upload_deletion_list: FileData[]): Promise<string[]> => {
  if (!Array.isArray(upload_deletion_list) || upload_deletion_list.length === 0) {
    return ['No uploads were removed']
  }
  try {
    const hashes = upload_deletion_list.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const url = `${import.meta.env.VITE_API_BASE_URL}/delete_uploads?${query}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
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
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const downloaded_files = await response.json();
      return downloaded_files;
    }
  } catch (error) {
    console.error('An error occurred while download files: ', error);
    return [];
  }
}
export const start_push_to_DB = async (uploads: FileData[], collection: string): Promise<string[]> => {
  if (!Array.isArray(uploads) || uploads.length === 0) {
    return ['No uploads to push']
  }
  try {
    const query_collection = [collection].map(collection => `collection=${encodeURIComponent(collection)}`).join('&');
    const query = query_collection
    const url = `${import.meta.env.VITE_API_BASE_URL}/initiate_push_to_db?${query}`
    const response = await fetch(url);
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const pushed_files = await response.json();
      return pushed_files
    }
  } catch (error) {
    console.error('Error refreshing database:', error);
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
      },
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const deleted_files = await response.json();
      return deleted_files;
    }
  } catch (error) {
    console.error('An error while deleting files from the collection: ', error)
    return [];
  }
}
export const start_create_collection = async (collection_name: string, embedding_function: string): Promise<string> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/create_collection`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection_name: collection_name,
        embedding_function: embedding_function
      })
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const collection = await response.json();
      return collection;
    }
  } catch (error) {
    console.error('Error creating a new collection: ', error)
    return ''
  }
}
export const start_delete_collection = async (collection: string): Promise<string> => {
  try {
    const query_collection = [collection].map(collection => `collection=${encodeURIComponent(collection)}`).join('&');
    const query = query_collection
    const url = `${import.meta.env.VITE_API_BASE_URL}/delete_collection?${query}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const deleted_collection = response.json();
      return deleted_collection;
    }
  } catch (error) {
    console.error('Error deleting the collection: ', error)
    return ''
  }
}
export const start_submit_query = async (user_query: string, query_type: string): Promise<ContextMessage> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/submit_query`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query_text: user_query,
        query_type: query_type
      })
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const llm_response = await response.json();
      const message_model = llm_response['message_model'];
      return message_model;
    }
  } catch (error) {
    console.error('There was an error submitting your query:', error);
    throw error;
  }
}
export const start_summarization = async (files: FileData[]): Promise<string> => {
  if (!Array.isArray(files) || files.length === 0) {
    return 'There were no files to summarize'
  }
  try {
    const hashes = files.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const url = `${import.meta.env.VITE_API_BASE_URL}/summary?${query}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const summary = await response.json();
      return summary;
    }
  } catch (error) {
    console.error('An error occurred while generating a summary: ', error)
    return ''
  }
}

export const start_theme_analysis = async (files: FileData[]) => {
  if (!Array.isArray(files) || files.length === 0) {
    return ['There were no files to analyze']
  }
  try {
    const hashes = files.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const url = `${import.meta.env.VITE_API_BASE_URL}/theme?${query}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      const themes = await response.json();
      // const highlights = await start_submit_query(themes, 'statement');
      return themes;
    }
  } catch (error) {
    console.error('An error occurred while analyzing themes: ', error)
  }
}