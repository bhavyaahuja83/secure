// Backend Integration Layer for FastAPI
// This file contains all the necessary hooks and utilities for backend integration

export interface APIConfig {
  baseURL: string;
  apiKey?: string;
  timeout: number;
}

export const apiConfig: APIConfig = {
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:8000/api',
  timeout: 10000
};

// Generic API client
export class APIClient {
  private baseURL: string;
  private timeout: number;
  private apiKey?: string;

  constructor(config: APIConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options.headers,
    };

    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  }
}

// Initialize API client
export const apiClient = new APIClient(apiConfig);

// Backend API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
    USERS: '/auth/users',
  },
  
  // Bills
  BILLS: {
    LIST: '/bills',
    CREATE: '/bills',
    GET: (id: string) => `/bills/${id}`,
    UPDATE: (id: string) => `/bills/${id}`,
    DELETE: (id: string) => `/bills/${id}`,
    PDF: (id: string) => `/bills/${id}/pdf`,
    STATS: '/bills/stats',
  },
  
  // Purchases
  PURCHASES: {
    LIST: '/purchases',
    CREATE: '/purchases',
    GET: (id: string) => `/purchases/${id}`,
    UPDATE: (id: string) => `/purchases/${id}`,
    DELETE: (id: string) => `/purchases/${id}`,
    OCR: '/purchases/ocr',
  },
  
  // Clients
  CLIENTS: {
    LIST: '/clients',
    CREATE: '/clients',
    GET: (id: string) => `/clients/${id}`,
    UPDATE: (id: string) => `/clients/${id}`,
    DELETE: (id: string) => `/clients/${id}`,
    STATS: '/clients/stats',
  },
  
  // Inventory
  INVENTORY: {
    LIST: '/inventory',
    CREATE: '/inventory',
    GET: (id: string) => `/inventory/${id}`,
    UPDATE: (id: string) => `/inventory/${id}`,
    DELETE: (id: string) => `/inventory/${id}`,
    LOW_STOCK: '/inventory/low-stock',
    BULK_UPDATE: '/inventory/bulk-update',
  },
  
  // Reports
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    SALES: '/reports/sales',
    PURCHASES: '/reports/purchases',
    INVENTORY: '/reports/inventory',
    CLIENTS: '/reports/clients',
    GST: '/reports/gst',
    EXPORT: '/reports/export',
  },
  
  // File uploads
  FILES: {
    UPLOAD: '/files/upload',
    DELETE: (id: string) => `/files/${id}`,
  }
};

// Type-safe API hooks (ready for backend integration)
export const useBackendAPI = () => {
  const isConnected = false; // Will be true when backend is connected
  
  return {
    isConnected,
    apiClient,
    endpoints: API_ENDPOINTS,
  };
};