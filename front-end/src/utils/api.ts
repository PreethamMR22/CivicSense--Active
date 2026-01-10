const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  user?: any;
  token?: string;
  status?: number;
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
    } else if (includeAuth) {
      // If auth is required but no token is found, reject immediately
      throw new Error('No authentication token found');
    }
  }

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
    mode: 'cors',
    cache: 'no-cache',
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`Making ${method} request to ${url}`, { data });
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - Let the calling component handle the redirect
    if (response.status === 401) {
      localStorage.removeItem('token');
      // Return a structured error response instead of redirecting
      return {
        success: false,
        error: 'Invalid credentials. Please check your email and password.',
        status: 401
      };
    }
    
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

    // For the /auth/me endpoint, we need to return the user data directly
    if (endpoint === '/auth/me') {
      return {
        success: true,
        ...responseData,
        user: responseData.data // Map data to user for consistency
      };
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
