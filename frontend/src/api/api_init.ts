// This variable is set on log-in by AuthContext
export let current_user_id: string;

export const initializeApi = (user_id: string) => {
  current_user_id = user_id;
}
export const start_resend_otp = async (email: string): Promise<void> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/resend_otp`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(email)
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
  } catch (error) {
    console.error('Error resending OTP: ', error);
  }
}
export const start_verify_otp = async (otp: string, email: string): Promise<boolean> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/verify_otp`
    const data = {
      'email': email,
      'otp': otp
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
  } catch (error) {
    console.error('Error verifying OTP: ', error);
    return false;
  }
  return true
}
export const start_session = async (): Promise<void> => {
  console.log("Starting session")
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/start_session`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: current_user_id })
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
  } catch (error) {
    console.error('Error starting session: ', error);
  }
}
export const start_login = async (username: string, password: string): Promise<string> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/login`
    const data = {
      'username': username,
      'pwd': password
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      return await response.json();
    }
  } catch (error) {
    console.error('Error validating user: ', error);
    return "";
  }
}
export const start_logout = async (): Promise<boolean> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/logout`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      }
    })
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      return await response.json();
    }
  } catch (error) {
    console.error('Error logging out: ', error);
    return false;
  }
}
export const start_register = async (username: string, email: string, password: string): Promise<string> => {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/register`
    const data = {
      'username': username,
      'email': email,
      'pwd': password
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'uuid': current_user_id
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) { throw new Error('Network response was not ok'); }
    else {
      return await response.json();
    }
  } catch (error) {
    console.error('Error registering user: ', error);
    return "";
  }
}
