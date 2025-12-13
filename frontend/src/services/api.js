// src/services/api.js
import axios from 'axios';
import {
  MOCK_STATS,
  MOCK_ROUTE_PERFORMANCE,
  MOCK_DELAY_BREAKDOWN,
  MOCK_AIRPORT_DELAYS,
  MOCK_CARRIER_SCORECARD
} from '../mockData';

// Check if we should use mock data
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('🔍 API Configuration:', {
  USE_MOCK,
  API_BASE_URL,
  env: process.env.REACT_APP_USE_MOCK
});

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API responses with realistic delays
const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

// Generate mock execution times
const generateMockMetrics = (rowCount) => ({
  execution_time_ms: Math.floor(Math.random() * 5000) + 2000, // 2-7 seconds
  row_count: rowCount,
  columns: Object.keys(rowCount > 0 ? {} : {})
});

export const apiService = {
  // Get database metrics/stats
  getDatabaseMetrics: async () => {
    if (USE_MOCK) {
      console.log('Using MOCK data for stats');
      return mockApiCall({
        success: true,
        metrics: MOCK_STATS
      }, 300);
    }
    
    try {
      const response = await api.get('/api/metrics/database');
      return response.data;
    } catch (error) {
      console.error('API Error, falling back to mock data:', error);
      return {
        success: true,
        metrics: MOCK_STATS
      };
    }
  },

  // Get predefined queries
  getPredefinedQueries: async () => {
    if (USE_MOCK) {
      console.log('Using MOCK predefined queries');
      return mockApiCall({
        success: true,
        queries: [
          {
            id: 'query1',
            name: 'Best Carriers by Route (On-Time Performance)',
            description: 'Which carriers have the best on-time performance by route?',
          },
          {
            id: 'query2',
            name: 'Delay Cause Breakdown by Carrier',
            description: 'Root cause analysis of delays by carrier.',
          },
          {
            id: 'query3',
            name: 'Airports with Most Departure Delays',
            description: 'Which airports need more resources?',
          },
          {
            id: 'query4',
            name: 'Complete Carrier Performance Scorecard',
            description: 'Comprehensive metrics (30+ sec on normalized DB).',
          }
        ]
      }, 200);
    }

    try {
      const response = await api.get('/api/query/predefined');
      return response.data;
    } catch (error) {
      console.error('API Error, falling back to mock queries:', error);
      return {
        success: true,
        queries: [
          { id: 'query1', name: 'Best Carriers by Route', description: 'On-time performance' },
          { id: 'query2', name: 'Delay Cause Breakdown', description: 'Root cause analysis' },
          { id: 'query3', name: 'Airports with Most Delays', description: 'Resource planning' },
          { id: 'query4', name: 'Carrier Performance Scorecard', description: 'Comprehensive metrics' }
        ]
      };
    }
  },

  // Execute warehouse query
  executeWarehouseQuery: async (queryId) => {
    if (USE_MOCK) {
      console.log('Using MOCK data for warehouse query:', queryId);
      
      let mockData;
      switch(queryId) {
        case 'query1':
          mockData = MOCK_ROUTE_PERFORMANCE;
          break;
        case 'query2':
          mockData = MOCK_DELAY_BREAKDOWN;
          break;
        case 'query3':
          mockData = MOCK_AIRPORT_DELAYS;
          break;
        case 'query4':
          mockData = MOCK_CARRIER_SCORECARD;
          break;
        default:
          mockData = [];
      }

      return mockApiCall({
        success: true,
        data: mockData,
        execution_time_ms: Math.floor(Math.random() * 2000) + 2500, // 2.5-4.5s
        row_count: mockData.length,
        columns: mockData.length > 0 ? Object.keys(mockData[0]) : []
      }, 800);
    }

    try {
      const response = await api.post('/api/query/warehouse', { query: queryId });
      return response.data;
    } catch (error) {
      console.error('Warehouse query failed:', error);
      throw error;
    }
  },

  // Execute normalized query
  executeNormalizedQuery: async (queryId) => {
    if (USE_MOCK) {
      console.log('Using MOCK data for normalized query:', queryId);
      
      let mockData;
      switch(queryId) {
        case 'query1':
          mockData = MOCK_ROUTE_PERFORMANCE;
          break;
        case 'query2':
          mockData = MOCK_DELAY_BREAKDOWN;
          break;
        case 'query3':
          mockData = MOCK_AIRPORT_DELAYS;
          break;
        case 'query4':
          mockData = MOCK_CARRIER_SCORECARD;
          break;
        default:
          mockData = [];
      }

      return mockApiCall({
        success: true,
        data: mockData,
        execution_time_ms: Math.floor(Math.random() * 3000) + 7000, // 7-10s (slower than warehouse)
        row_count: mockData.length,
        columns: mockData.length > 0 ? Object.keys(mockData[0]) : []
      }, 1200);
    }

    try {
      const response = await api.post('/api/query/normalized', { query: queryId });
      return response.data;
    } catch (error) {
      console.error('Normalized query failed:', error);
      throw error;
    }
  },
};

export default apiService;
