import { current_user_id } from "./api_init";
import { Chat, FileData, ContextData } from "@/types/types";

export type StreamCallback = (chunk: string) => void;
export type MetadataCallback = (metadata: any) => void;
interface RawContext {
  collection: string;
  context: string;
  page: string;
  source: string;
  source_hash: string;
}
export const start_stream_query = async (
  query: string,
  onChunk: StreamCallback,
  onMetadata?: MetadataCallback,
  chat?: Chat,
  query_type: string = 'stream'
): Promise<void> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/stream_query`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
      body: JSON.stringify({
        query_text: query,
        chat: chat,
        query_type: query_type
      })
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);

      // Check if this chunk contains metadata
      if (chunk.includes('\n\nMETADATA:')) {
        const [textPart, metadataPart] = chunk.split('\n\nMETADATA:');

        // Send the text part if it exists
        if (textPart) {
          onChunk(textPart);
        }

        // Parse and send metadata
        if (metadataPart && onMetadata) {
          try {
            const metadata_raw = JSON.parse(metadataPart);

            const context_parsed: ContextData[] = metadata_raw.contexts.map((ctx: RawContext) => ({
              text: ctx.context,
              page: ctx.page,
              file: {
                hash: ctx.source_hash,
                name: ctx.source,
                collection: ctx.collection
              }
            }));

            onMetadata({
              ...metadata_raw,
              contexts: context_parsed
            });
          } catch (e) {
            console.error('Error parsing metadata:', e);
          }
        }
      } else {
        // Regular chunk without metadata
        onChunk(chunk);
      }
    }
  } catch (error) {
    console.error('There was an error streaming your query:', error);
    throw error;
  }
}

export const start_stt = async (audio: FormData): Promise<string> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/stt`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'uuid': current_user_id
      },
      body: audio
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      return await response.json();
    }
  } catch (error) {
    console.error('Error parsing audio: ', error);
    return ""
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
        'uuid': current_user_id
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
        'uuid': current_user_id
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