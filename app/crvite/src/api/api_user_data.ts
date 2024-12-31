import { current_user_id, start_logout } from "./api_init";
import { Chat } from "@/types/types";

export const start_save_chat = async (current_chat: Chat): Promise<boolean> => {
  const chat = JSON.stringify(current_chat)
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/save_chat`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
      body: chat
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      return true
    }
  } catch (error) {
    console.error('Error saving chat: ', error);
    return false
  }
}
export const start_delete_chat = async (chat_id: string): Promise<boolean> => {
  try {
    const query = `chat_id=${encodeURIComponent(chat_id)}`;
    const url = `${import.meta.env.VITE_API_BASE_URL}/delete_chat?${query}`
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      }
    })
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      return true
    }
  } catch (error) {
    console.error('Error deleting chats: ', error);
    return false
  }
}
export const fetch_saved_chats = async (): Promise<Chat[]> => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/saved_chats`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'uuid': current_user_id
        },
      })
      if (!response.ok) { throw new Error('Network response was not ok'); }
      else {
        const chats = await response.json();
        return chats;
      }
    } catch (error) {
      console.error('Error fetching chat history: ', error);
      return []
    }
  }
  export const start_delete_account = async (email: string, password: string): Promise<boolean> => {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/delete_account`
      const data = {
        'email': email,
        'pwd': password
      };
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'uuid': current_user_id
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) { throw new Error('Network response was not ok'); }
      else {
        const success = await response.json();
        if(success) {
          start_logout();
          return success;
        }
        else {
          return success
        }
      }
    } catch (error) {
      console.error('Error deleting user: ', error);
      return false;
    }
  }