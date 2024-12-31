import { current_user_id } from "./api_init";
import { FileData } from "@/types/types";

export const fetch_db_collections = async (): Promise<string[]> => {
  console.log("attempting to call fetch_db_collection")
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/collections`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
    });
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


export const start_push_to_DB = async (uploads: FileData[], collection: string): Promise<string[]> => {
    if (!Array.isArray(uploads) || uploads.length === 0) {
      return ['No uploads to push']
    }
    try {
      const query_collection = [collection].map(collection => `collections=${encodeURIComponent(collection)}`).join('&');
      const query = query_collection
      const url = `${import.meta.env.VITE_API_BASE_URL}/initiate_push_to_db?${query}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'uuid': current_user_id
        },
      });
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
  
  export const start_create_collection = async (collection_name: string, embedding_function: string): Promise<string> => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/create_collection`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'uuid': current_user_id
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
          'uuid': current_user_id
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