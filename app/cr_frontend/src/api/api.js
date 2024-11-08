export const fetch_db_files_metadata = async () => {
  // TODO: Make it collection specific
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/db_files_metadata`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const files = await response.json();
    return files;
  } catch (error) {
    console.error('Error fetching files:', error);
    return [];
  }
}
export const start_submit_query = async (user_query) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/submit_query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query_text: user_query })
    });
    const llm_response = await response.json();
    const message_model = llm_response['message_model'];
    return message_model;
  } catch (error) {
    console.error('There was an error submitting your query:', error);
  }
}
export const fetch_uploads_metadata = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/uploads_metadata`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const files = await response.json();
    return files;
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return [];
  }
}
export const start_push_to_DB = async (uploads) => {
  if (!Array.isArray(uploads) || uploads.length === 0) {
    return ['No uploads to push']
  }
  try {
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/initiate_push_to_db`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    else {
      const pushed_files = await response.json();
      return pushed_files
    }
  } catch (error) {
    console.error('Error refreshing database:', error);
    return [];
  }
}
export const start_upload_deletion = async (upload_deletion_list) => {
  if (!Array.isArray(upload_deletion_list) || upload_deletion_list.length === 0) {
    return ['No uploads were removed']
  }
  try {
    const hashes = upload_deletion_list.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delete_uploads?${query}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const deleted_uploads = await response.json();
    return deleted_uploads
  } catch (error) {
    console.error('An error occurred while deleting uploads: ', error)
  }
}
export const start_file_deletion = async (file_deletion_list) => {
  if (!Array.isArray(file_deletion_list) || file_deletion_list.length === 0) {
    return ['No files were deleted']
  }
  try {
    const hashes = file_deletion_list.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/delete_files?${query}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const deleted_files = await response.json();
    return deleted_files
  } catch (error) {
    console.error('An error while deleting files from the collection: ', error)
  }
}
export const start_file_download = async (file_download_list) => {
  if (!Array.isArray(file_download_list) || file_download_list.length === 0) {
    return ['No files were downloaded']
  }
  try {
    const hashes = file_download_list.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/download_files?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const downloaded_files = await response.json();
    return downloaded_files
  } catch (error) {
    console.error('An error occurred while download files: ', error)
  }
}
export const start_summarization = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return ['There were no files to summarize']
  }
  try {
    const hashes = files.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/summary?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const summary = await response.json();
    return summary;
  } catch (error) {
    console.error('An error occurred while generating a summary: ', error)
  }
}

export const start_theme_analysis = async (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return ['There were no files to analyze']
  }
  try {
    const hashes = files.map(item => item.hash);
    const query = hashes.map(hash => `hashes=${encodeURIComponent(hash)}`).join('&');
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/summary?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const themes = await response.json();
    const highlights = await start_submit_query(themes);
    return highlights;
  } catch (error) {
    console.error('An error occurred while analyzing themes: ', error)
  }
}