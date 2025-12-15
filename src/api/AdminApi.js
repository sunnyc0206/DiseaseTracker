import axios from 'axios';

const BACKEND_URL = 'http://localhost:8080/api';

// Create axios instance with auth headers
const apiClient = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Add auth token to requests if available
apiClient.interceptors.request.use(
  config => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      const { email, password } = JSON.parse(adminAuth);
      // Use basic auth for now
      config.auth = { username: email, password };
      console.log('Adding auth to request:', config.url, 'with user:', email);
    } else {
      console.log('No auth found for request:', config.url);
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    console.log('Response error:', error.response?.status, error.config?.url, error.message);
    
    if (error.response && error.response.status === 401) {
      // Only clear auth and redirect if we're making an authenticated request
      // Don't clear on login attempts or public endpoints
      const isLoginRequest = error.config.url.includes('/auth/login');
      const isPublicRequest = error.config.url.includes('/public/');
      const isVerifyRequest = error.config.url.includes('/auth/verify');
      
      // Don't retry if already retried
      if (!error.config._retry && !isLoginRequest && !isPublicRequest && !isVerifyRequest) {
        error.config._retry = true;
        
        // Try to use saved credentials one more time
        const adminAuth = localStorage.getItem('adminAuth');
        if (adminAuth) {
          const { email, password } = JSON.parse(adminAuth);
          error.config.auth = { username: email, password };
          
          // Retry the request
          try {
            return await apiClient.request(error.config);
          } catch (retryError) {
            // If retry also fails, then clear auth
            console.error('Auth retry failed, clearing credentials');
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('adminUser');
            
            // Only redirect if we're not already on the login page
            if (!window.location.pathname.includes('/admin/login')) {
              window.location.href = '/admin/login';
            }
          }
        }
      }
      
      // Return a rejected promise to prevent further processing
      return Promise.reject({
        ...error,
        handled: true,
        message: 'Authentication required'
      });
    }
    return Promise.reject(error);
  }
);

class AdminApi {
  // Auth operations
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success) {
        // Store credentials for basic auth
        localStorage.setItem('adminAuth', JSON.stringify({ email, password }));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    localStorage.removeItem('adminAuth');
  }

  async verifyAuth() {
    try {
      // Create a special axios instance for auth verification that doesn't trigger redirects
      const verifyClient = axios.create({
        baseURL: BACKEND_URL,
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      // Add auth if available
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        const { email, password } = JSON.parse(adminAuth);
        verifyClient.defaults.auth = { username: email, password };
      }
      
      const response = await verifyClient.get('/auth/verify');
      return response.data;
    } catch (error) {
      // Don't trigger any redirects or popups for auth verification
      return { success: false };
    }
  }

  // Disease management
  async getAllDiseases() {
    try {
      const response = await apiClient.get('/admin/diseases');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching diseases:', error);
      if (error.handled) {
        // Auth error already handled by interceptor
        throw error;
      }
      return { success: false, error: error.message, data: [] };
    }
  }

  async getDisease(id) {
    try {
      const response = await apiClient.get(`/admin/diseases/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching disease:', error);
      throw error;
    }
  }

  async createDisease(diseaseData) {
    try {
      const response = await apiClient.post('/admin/diseases', diseaseData);
      return response.data;
    } catch (error) {
      console.error('Error creating disease:', error);
      throw error;
    }
  }

  async updateDisease(id, diseaseData) {
    try {
      const response = await apiClient.put(`/admin/diseases/${id}`, diseaseData);
      return response.data;
    } catch (error) {
      console.error('Error updating disease:', error);
      throw error;
    }
  }

  async deleteDisease(id) {
    try {
      const response = await apiClient.delete(`/admin/diseases/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting disease:', error);
      throw error;
    }
  }

  async toggleDiseaseVisibility(id) {
    try {
      const disease = await this.getDisease(id);
      const updatedDisease = { ...disease, featured: !disease.featured };
      return await this.updateDisease(id, updatedDisease);
    } catch (error) {
      console.error('Error toggling disease visibility:', error);
      throw error;
    }
  }

  // News management through backend
  async getAllNews() {
    try {
      const response = await apiClient.get('/admin/news');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin news:', error);
      throw error;
    }
  }

  async createNews(newsData) {
    try {
      const response = await apiClient.post('/admin/news', newsData);
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  async updateNews(id, newsData) {
    try {
      const response = await apiClient.put(`/admin/news/${id}`, newsData);
      return response.data;
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  async deleteNews(id) {
    try {
      const response = await apiClient.delete(`/admin/news/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  async toggleNewsVisibility(id) {
    try {
      const response = await apiClient.put(`/admin/news/${id}/toggle-visibility`);
      return response.data;
    } catch (error) {
      console.error('Error toggling news visibility:', error);
      throw error;
    }
  }

  // Import/Export operations
  async importData(data) {
    // For now, handle client-side
    const importResults = {
      diseases: { imported: 0, failed: 0 },
      news: { imported: 0, failed: 0 }
    };

    // Import diseases to backend
    if (data.diseases && Array.isArray(data.diseases)) {
      for (const disease of data.diseases) {
        try {
          await this.createDisease(disease);
          importResults.diseases.imported++;
        } catch (error) {
          importResults.diseases.failed++;
        }
      }
    }

    // Import news to localStorage
    if (data.news && Array.isArray(data.news)) {
      const existingNews = await this.getAllNews();
      const newNews = [...existingNews, ...data.news.map(item => ({
        ...item,
        id: Date.now() + Math.random(),
        visible: true
      }))];
      localStorage.setItem('adminNews', JSON.stringify(newNews));
      importResults.news.imported = data.news.length;
    }

    return importResults;
  }

  async exportData() {
    const diseases = await this.getAllDiseases();
    const news = await this.getAllNews();
    
    return {
      diseases,
      news,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }

  // Dashboard statistics
  async getDashboardStats() {
    try {
      const diseases = await this.getAllDiseases();
      const news = await this.getAllNews();
      
      const totalCases = diseases.reduce((sum, d) => sum + (d.totalCases || 0), 0);
      const totalDeaths = diseases.reduce((sum, d) => sum + (d.deaths || 0), 0);
      const totalRecovered = diseases.reduce((sum, d) => sum + (d.recoveredCases || 0), 0);
      const activeCases = diseases.reduce((sum, d) => sum + (d.activeCases || 0), 0);
      
      return {
        totalDiseases: diseases.length,
        visibleDiseases: diseases.filter(d => d.featured !== false).length,
        totalNews: news.length,
        visibleNews: news.filter(n => n.visible !== false).length,
        totalCases,
        totalDeaths,
        totalRecovered,
        activeCases,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalDiseases: 0,
        visibleDiseases: 0,
        totalNews: 0,
        visibleNews: 0,
        totalCases: 0,
        totalDeaths: 0,
        totalRecovered: 0,
        activeCases: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }
  
  // API Key management
  async getAllApiKeys() {
    try {
      const response = await apiClient.get('/admin/api-keys');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch API keys' };
    }
  }
  
  async getApiKeyByName(name) {
    try {
      const response = await apiClient.get(`/admin/api-keys/${name}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching API key:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch API key' };
    }
  }
  
  async createApiKey(apiKeyData) {
    try {
      const response = await apiClient.post('/admin/api-keys', apiKeyData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating API key:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create API key' };
    }
  }
  
  async updateApiKey(id, apiKeyData) {
    try {
      const response = await apiClient.put(`/admin/api-keys/${id}`, apiKeyData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating API key:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update API key' };
    }
  }
  
  async deleteApiKey(id) {
    try {
      const response = await apiClient.delete(`/admin/api-keys/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting API key:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete API key' };
    }
  }
  
  async toggleApiKeyStatus(id) {
    try {
      const response = await apiClient.put(`/admin/api-keys/${id}/toggle-status`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error toggling API key status:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to toggle API key status' };
    }
  }
  
  // Public method to get API key (no auth required)
  async getPublicApiKey(name) {
    try {
      const response = await axios.get(`${BACKEND_URL}/public/api-keys/${name}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching public API key:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch API key' };
    }
  }
}

export const adminApi = new AdminApi(); 