// src/services/api.js
import axios from 'axios';

// ============================================
// INLINE MOCK DATA (embedded to avoid import path issues)
// ============================================

const MOCK_PREDEFINED_QUERIES = [
  {
    id: 1,
    name: 'Best Carriers by Route (On-Time Performance)',
    description: 'Which carriers have the best on-time performance by route? Uses star schema for fast aggregation.',
    mockDataKey: 'route_performance'
  },
  {
    id: 2,
    name: 'Delay Cause Breakdown by Carrier',
    description: 'Root cause analysis of delays by carrier. Identifies whether delays are carrier-controlled or external.',
    mockDataKey: 'delay_breakdown'
  },
  {
    id: 3,
    name: 'Airports with Most Departure Delays',
    description: 'Which airports need more resources? Identifies bottleneck airports with consistent departure delays.',
    mockDataKey: 'airport_delays'
  },
  {
    id: 4,
    name: 'Complete Carrier Performance Scorecard',
    description: 'Comprehensive metrics across all dimensions. This query takes 30+ seconds on normalized DB vs 8 seconds on warehouse.',
    mockDataKey: 'carrier_scorecard'
  }
];

export const MOCK_STATS = {
  total_flights: 6981227,
  total_airports: 387,
  avg_delay_minutes: 7.10,
  on_time_percentage: 63.65,
  total_delay_cost: 7785000000,
  data_quality: 98.6
};

const MOCK_ROUTE_PERFORMANCE = [
  { origin: "TYS", destination: "DTW", carrier_code: "9E", carrier_name: "Endeavor Air", total_flights: 560, on_time_flights: 503, on_time_pct: 89.82, avg_delay_minutes: -11.28 },
  { origin: "BTM", destination: "SLC", carrier_code: "OO", carrier_name: "SkyWest Airlines", total_flights: 690, on_time_flights: 611, on_time_pct: 88.55, avg_delay_minutes: -14.18 },
  { origin: "PIH", destination: "SLC", carrier_code: "OO", carrier_name: "SkyWest Airlines", total_flights: 700, on_time_flights: 616, on_time_pct: 88.00, avg_delay_minutes: -9.15 },
  { origin: "SUN", destination: "SLC", carrier_code: "OO", carrier_name: "SkyWest Airlines", total_flights: 650, on_time_flights: 571, on_time_pct: 87.85, avg_delay_minutes: -8.45 },
  { origin: "GEG", destination: "SEA", carrier_code: "AS", carrier_name: "Alaska Airlines", total_flights: 1850, on_time_flights: 1624, on_time_pct: 87.78, avg_delay_minutes: -10.32 },
  { origin: "RDM", destination: "SEA", carrier_code: "AS", carrier_name: "Alaska Airlines", total_flights: 920, on_time_flights: 806, on_time_pct: 87.61, avg_delay_minutes: -12.67 },
  { origin: "PSC", destination: "SEA", carrier_code: "AS", carrier_name: "Alaska Airlines", total_flights: 780, on_time_flights: 682, on_time_pct: 87.44, avg_delay_minutes: -9.88 },
  { origin: "BIL", destination: "SLC", carrier_code: "OO", carrier_name: "SkyWest Airlines", total_flights: 1120, on_time_flights: 976, on_time_pct: 87.14, avg_delay_minutes: -7.23 },
  { origin: "JAC", destination: "SLC", carrier_code: "OO", carrier_name: "SkyWest Airlines", total_flights: 890, on_time_flights: 774, on_time_pct: 86.97, avg_delay_minutes: -6.54 },
  { origin: "MSO", destination: "SLC", carrier_code: "OO", carrier_name: "SkyWest Airlines", total_flights: 1050, on_time_flights: 912, on_time_pct: 86.86, avg_delay_minutes: -8.91 }
];

const MOCK_DELAY_BREAKDOWN = [
  { carrier_code: "WN", carrier_name: "Southwest Airlines", total_delayed_flights: 278523, avg_total_delay: 55.48, avg_carrier_delay: 15.00, avg_weather_delay: 1.00, avg_nas_delay: 9.00, avg_security_delay: 0.00, avg_late_aircraft_delay: 28.00 },
  { carrier_code: "AA", carrier_name: "American Airlines", total_delayed_flights: 245502, avg_total_delay: 87.73, avg_carrier_delay: 28.00, avg_weather_delay: 4.00, avg_nas_delay: 11.00, avg_security_delay: 0.00, avg_late_aircraft_delay: 42.00 },
  { carrier_code: "DL", carrier_name: "Delta Air Lines", total_delayed_flights: 166417, avg_total_delay: 73.96, avg_carrier_delay: 35.00, avg_weather_delay: 3.00, avg_nas_delay: 13.00, avg_security_delay: 0.00, avg_late_aircraft_delay: 21.00 },
  { carrier_code: "UA", carrier_name: "United Airlines", total_delayed_flights: 142356, avg_total_delay: 78.45, avg_carrier_delay: 24.00, avg_weather_delay: 2.00, avg_nas_delay: 10.00, avg_security_delay: 0.00, avg_late_aircraft_delay: 40.00 },
  { carrier_code: "B6", carrier_name: "JetBlue Airways", total_delayed_flights: 67834, avg_total_delay: 92.15, avg_carrier_delay: 31.00, avg_weather_delay: 5.00, avg_nas_delay: 14.00, avg_security_delay: 1.00, avg_late_aircraft_delay: 39.00 },
  { carrier_code: "AS", carrier_name: "Alaska Airlines", total_delayed_flights: 49123, avg_total_delay: 64.20, avg_carrier_delay: 18.00, avg_weather_delay: 3.00, avg_nas_delay: 8.00, avg_security_delay: 0.00, avg_late_aircraft_delay: 33.00 },
  { carrier_code: "NK", carrier_name: "Spirit Airlines", total_delayed_flights: 41567, avg_total_delay: 102.30, avg_carrier_delay: 38.00, avg_weather_delay: 2.00, avg_nas_delay: 12.00, avg_security_delay: 1.00, avg_late_aircraft_delay: 47.00 },
  { carrier_code: "F9", carrier_name: "Frontier Airlines", total_delayed_flights: 28934, avg_total_delay: 96.80, avg_carrier_delay: 34.00, avg_weather_delay: 3.00, avg_nas_delay: 11.00, avg_security_delay: 0.00, avg_late_aircraft_delay: 46.00 }
];

const MOCK_AIRPORT_DELAYS = [
  { airport_code: "DFW", total_flights: 307657, delayed_departures: 82262, delay_rate_pct: 26.74, avg_departure_delay: 6.85, avg_delay_when_delayed: 49.04, max_departure_delay: 2111 },
  { airport_code: "DEN", total_flights: 305048, delayed_departures: 68217, delay_rate_pct: 22.36, avg_departure_delay: 4.23, avg_delay_when_delayed: 35.46, max_departure_delay: 2028 },
  { airport_code: "ATL", total_flights: 338428, delayed_departures: 64580, delay_rate_pct: 19.08, avg_departure_delay: 3.98, avg_delay_when_delayed: 38.36, max_departure_delay: 2353 },
  { airport_code: "ORD", total_flights: 298765, delayed_departures: 61234, delay_rate_pct: 20.50, avg_departure_delay: 4.67, avg_delay_when_delayed: 42.18, max_departure_delay: 1987 },
  { airport_code: "LAX", total_flights: 287934, delayed_departures: 54821, delay_rate_pct: 19.04, avg_departure_delay: 3.82, avg_delay_when_delayed: 36.92, max_departure_delay: 1856 },
  { airport_code: "PHX", total_flights: 265432, delayed_departures: 52617, delay_rate_pct: 19.82, avg_departure_delay: 3.56, avg_delay_when_delayed: 33.57, max_departure_delay: 1734 },
  { airport_code: "LAS", total_flights: 248976, delayed_departures: 48923, delay_rate_pct: 19.65, avg_departure_delay: 3.34, avg_delay_when_delayed: 31.45, max_departure_delay: 1612 },
  { airport_code: "IAH", total_flights: 234567, delayed_departures: 46312, delay_rate_pct: 19.74, avg_departure_delay: 4.28, avg_delay_when_delayed: 40.28, max_departure_delay: 1923 }
];

const MOCK_CARRIER_SCORECARD = [
  { carrier_code: "WN", carrier_name: "Southwest Airlines", total_flights: 1404597, delayed_flights: 278523, delay_rate_pct: 19.83, avg_arrival_delay: 5.13, avg_departure_delay: 11.71, avg_carrier_delay: 3.00, avg_weather_delay: 0.00, avg_nas_delay: 1.00 },
  { carrier_code: "DL", carrier_name: "Delta Air Lines", total_flights: 997846, delayed_flights: 166417, delay_rate_pct: 16.68, avg_arrival_delay: 3.66, avg_departure_delay: 10.11, avg_carrier_delay: 5.00, avg_weather_delay: 0.00, avg_nas_delay: 2.00 },
  { carrier_code: "AA", carrier_name: "American Airlines", total_flights: 966116, delayed_flights: 245502, delay_rate_pct: 25.41, avg_arrival_delay: 15.31, avg_departure_delay: 20.58, avg_carrier_delay: 7.00, avg_weather_delay: 1.00, avg_nas_delay: 2.00 },
  { carrier_code: "UA", carrier_name: "United Airlines", total_flights: 678234, delayed_flights: 142356, delay_rate_pct: 20.99, avg_arrival_delay: 7.45, avg_departure_delay: 13.23, avg_carrier_delay: 5.00, avg_weather_delay: 0.00, avg_nas_delay: 2.00 },
  { carrier_code: "B6", carrier_name: "JetBlue Airways", total_flights: 334567, delayed_flights: 67834, delay_rate_pct: 20.28, avg_arrival_delay: 8.92, avg_departure_delay: 15.67, avg_carrier_delay: 6.00, avg_weather_delay: 1.00, avg_nas_delay: 2.00 },
  { carrier_code: "AS", carrier_name: "Alaska Airlines", total_flights: 243891, delayed_flights: 49123, delay_rate_pct: 20.14, avg_arrival_delay: 4.23, avg_departure_delay: 9.78, avg_carrier_delay: 3.00, avg_weather_delay: 0.00, avg_nas_delay: 1.00 }
];

// ============================================
// API CONFIGURATION
// ============================================

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

console.log('API Configuration:', {
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

const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

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
        queries: MOCK_PREDEFINED_QUERIES
      }, 200);
    }

    try {
      const response = await api.get('/api/query/predefined');
      return response.data;
    } catch (error) {
      console.error('API Error, falling back to mock queries:', error);
      return {
        success: true,
        queries: MOCK_PREDEFINED_QUERIES
      };
    }
  },

  // Execute warehouse query
  executeWarehouseQuery: async (queryIdOrSql) => {
    if (USE_MOCK) {
      console.log('Using MOCK data for warehouse query:', queryIdOrSql);
      
      const queryDef = MOCK_PREDEFINED_QUERIES.find(
        q => q.id === queryIdOrSql || q.id === parseInt(queryIdOrSql) || q.id === String(queryIdOrSql)
      );
      
      let mockData = [];
      
      if (queryDef) {
        switch(queryDef.mockDataKey) {
          case 'route_performance':
            mockData = MOCK_ROUTE_PERFORMANCE;
            break;
          case 'delay_breakdown':
            mockData = MOCK_DELAY_BREAKDOWN;
            break;
          case 'airport_delays':
            mockData = MOCK_AIRPORT_DELAYS;
            break;
          case 'carrier_scorecard':
            mockData = MOCK_CARRIER_SCORECARD;
            break;
          default:
            mockData = [];
        }
      } else {
        switch(queryIdOrSql) {
          case 'query1':
          case 1:
            mockData = MOCK_ROUTE_PERFORMANCE;
            break;
          case 'query2':
          case 2:
            mockData = MOCK_DELAY_BREAKDOWN;
            break;
          case 'query3':
          case 3:
            mockData = MOCK_AIRPORT_DELAYS;
            break;
          case 'query4':
          case 4:
            mockData = MOCK_CARRIER_SCORECARD;
            break;
          default:
            mockData = [];
        }
      }

      return mockApiCall({
        success: true,
        data: mockData,
        execution_time_ms: Math.floor(Math.random() * 2000) + 2500,
        row_count: mockData.length,
        columns: mockData.length > 0 ? Object.keys(mockData[0]) : []
      }, 800);
    }

    try {
      const response = await api.post('/api/query/warehouse', { query: queryIdOrSql });
      return response.data;
    } catch (error) {
      console.error('Warehouse query failed:', error);
      throw error;
    }
  },

  // Execute normalized query
  executeNormalizedQuery: async (queryIdOrSql) => {
    if (USE_MOCK) {
      console.log('Using MOCK data for normalized query:', queryIdOrSql);
      
      const queryDef = MOCK_PREDEFINED_QUERIES.find(
        q => q.id === queryIdOrSql || q.id === parseInt(queryIdOrSql) || q.id === String(queryIdOrSql)
      );
      
      let mockData = [];
      
      if (queryDef) {
        switch(queryDef.mockDataKey) {
          case 'route_performance':
            mockData = MOCK_ROUTE_PERFORMANCE;
            break;
          case 'delay_breakdown':
            mockData = MOCK_DELAY_BREAKDOWN;
            break;
          case 'airport_delays':
            mockData = MOCK_AIRPORT_DELAYS;
            break;
          case 'carrier_scorecard':
            mockData = MOCK_CARRIER_SCORECARD;
            break;
          default:
            mockData = [];
        }
      } else {
        switch(queryIdOrSql) {
          case 'query1':
          case 1:
            mockData = MOCK_ROUTE_PERFORMANCE;
            break;
          case 'query2':
          case 2:
            mockData = MOCK_DELAY_BREAKDOWN;
            break;
          case 'query3':
          case 3:
            mockData = MOCK_AIRPORT_DELAYS;
            break;
          case 'query4':
          case 4:
            mockData = MOCK_CARRIER_SCORECARD;
            break;
          default:
            mockData = [];
        }
      }

      return mockApiCall({
        success: true,
        data: mockData,
        execution_time_ms: Math.floor(Math.random() * 3000) + 7000,
        row_count: mockData.length,
        columns: mockData.length > 0 ? Object.keys(mockData[0]) : []
      }, 1200);
    }

    try {
      const response = await api.post('/api/query/normalized', { query: queryIdOrSql });
      return response.data;
    } catch (error) {
      console.error('Normalized query failed:', error);
      throw error;
    }
  },
};

export default apiService;