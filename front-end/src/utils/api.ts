const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: any;
  token?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Add auth token if needed
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Important for cookies
    mode: 'cors',
    cache: 'no-cache',
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`Making ${method} request to ${url}`, { data });
    const response = await fetch(url, config);
    
    // Parse response data
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Unexpected response format: ${text}`);
    }

    if (!response.ok) {
      const errorMessage = responseData.message || 
                         responseData.error || 
                         `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    // Store the token in localStorage if present in the response
    if (responseData.token) {
      localStorage.setItem('token', responseData.token);
      console.log('Token stored in localStorage');
    }

    return {
      success: true,
      ...responseData,
    };
  } catch (error: unknown) {
    console.error('API request failed:', error);
    
    // Handle network errors
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return {
          success: false,
          error: 'Unable to connect to the server. Please check your internet connection.',
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'An unknown error occurred',
    };
  }
}
