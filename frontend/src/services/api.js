import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Execute custom query
  executeQuery: async (query) => {
    try {
      const response = await apiClient.post('/query/execute', { query });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to execute query';
    }
  },

  // Execute parallel queries
  executeParallelQueries: async (queries, labels) => {
    try {
      const response = await apiClient.post('/query/parallel', { queries, labels });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to execute parallel queries';
    }
  },

  // Get predefined queries
  getPredefinedQueries: async () => {
    try {
      const response = await apiClient.get('/query/predefined');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to fetch predefined queries';
    }
  },

  // Execute predefined query
  executePredefinedQuery: async (queryId) => {
    try {
      const response = await apiClient.post(`/query/predefined/${queryId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to execute predefined query';
    }
  },

  // Get database metrics
  getDatabaseMetrics: async () => {
    try {
      const response = await apiClient.get('/metrics/database');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to fetch database metrics';
    }
  },

  // Get data quality metrics
  getDataQualityMetrics: async () => {
    try {
      const response = await apiClient.get('/metrics/data-quality');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to fetch data quality metrics';
    }
  },

  // Execute comparison query on both databases
  executeComparisonQuery: async (query) => {
    try {
      const response = await apiClient.post('/query/compare', { query });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to execute comparison query';
    }
  },

  // Execute query on warehouse database only
  executeWarehouseQuery: async (query) => {
    try {
      const response = await apiClient.post('/query/warehouse', { query });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to execute warehouse query';
    }
  },

  // Execute query on normalized database only
  executeNormalizedQuery: async (query) => {
    try {
      const response = await apiClient.post('/query/normalized', { query });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || error.message || 'Failed to execute normalized query';
    }
  },
};

export default apiService;