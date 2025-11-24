import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  LinearProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Grid,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TableRowsIcon from '@mui/icons-material/TableRows';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QueryEditor from './components/QueryEditor';
import PredefinedQueries from './components/PredefinedQueries';
import ResultsTable from './components/ResultsTable';
import { apiService } from './services/api';
import { getTheme } from './theme';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [predefinedQueries, setPredefinedQueries] = useState([]);
  const [results, setResults] = useState(null);
  const [queryMetrics, setQueryMetrics] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Predefined, 1 = Custom
  const [comparisonResults, setComparisonResults] = useState(null);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [normalizedLoading, setNormalizedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const theme = getTheme(darkMode ? 'dark' : 'light');

  // Fetch database stats on mount
  useEffect(() => {
    fetchDatabaseStats();
    fetchPredefinedQueries();
  }, []);

  const fetchDatabaseStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiService.getDatabaseMetrics();
      setStats(data.metrics || data);
    } catch (error) {
      console.error('Error fetching database stats:', error);
      showSnackbar('Failed to fetch database statistics', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPredefinedQueries = async () => {
    try {
      const data = await apiService.getPredefinedQueries();
      setPredefinedQueries(data.queries || []);
    } catch (error) {
      console.error('Error fetching predefined queries:', error);
      showSnackbar('Failed to fetch predefined queries', 'error');
    }
  };

  const handleExecuteCustomQuery = async (query) => {
    handleComparisonQuery(query);
  };

  const handleExecutePredefinedQuery = async (queryId) => {
    // Get the query SQL from predefined queries
    const query = predefinedQueries.find(q => q.id === queryId);
    if (query) {
      handleComparisonQuery(query.sql);
    }
  };

  const handleComparisonQuery = async (query) => {
    setWarehouseLoading(true);
    setNormalizedLoading(true);
    setError(null);
    setComparisonResults(null);

    // Initialize results structure
    let warehouseData = null;
    let normalizedData = null;

    // Make parallel API calls to both databases
    const warehousePromise = apiService.executeWarehouseQuery(query)
      .then((result) => {
        warehouseData = result;
        setWarehouseLoading(false);
        return result;
      })
      .catch((err) => {
        setWarehouseLoading(false);
        throw new Error(`Warehouse query failed: ${err.message || err}`);
      });

    const normalizedPromise = apiService.executeNormalizedQuery(query)
      .then((result) => {
        normalizedData = result;
        setNormalizedLoading(false);
        return result;
      })
      .catch((err) => {
        setNormalizedLoading(false);
        throw new Error(`Normalized query failed: ${err.message || err}`);
      });

    try {
      // Wait for both queries to complete
      await Promise.all([warehousePromise, normalizedPromise]);

      // Calculate comparison metrics
      const warehouseTime = warehouseData.execution_time_ms;
      const normalizedTime = normalizedData.execution_time_ms;
      const speedup = warehouseTime > 0 ? (normalizedTime / warehouseTime).toFixed(2) : 1.0;
      const improvementPct = normalizedTime > 0 
        ? (((normalizedTime - warehouseTime) / normalizedTime) * 100).toFixed(1) 
        : 0.0;
      const timeSaved = (normalizedTime - warehouseTime).toFixed(2);

      // Update results
      const finalResults = {
        warehouse: {
          data: warehouseData.data,
          execution_time_ms: warehouseData.execution_time_ms,
          row_count: warehouseData.row_count,
          columns: warehouseData.columns,
        },
        normalized: {
          data: normalizedData.data,
          execution_time_ms: normalizedData.execution_time_ms,
          row_count: normalizedData.row_count,
          columns: normalizedData.columns,
        },
        comparison: {
          speedup: parseFloat(speedup),
          improvement_pct: parseFloat(improvementPct),
          time_saved_ms: parseFloat(timeSaved),
        },
      };

      setComparisonResults(finalResults);
      setSnackbar({
        open: true,
        message: `Comparison complete! Warehouse is ${speedup}× faster`,
        severity: 'success',
      });
    } catch (err) {
      setError(err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to execute comparison query',
        severity: 'error',
      });
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <Box sx={{ flexGrow: 1, textAlign: 'center', mt: '10px', ml: '10px', mr: '10px' }}>
              <Typography variant="h3" component="div" fontWeight="bold" sx={{ mb: 0.5 }}>
                Flight Data Warehouse - Query Interface
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                2024 US Domestic Flights Analysis
              </Typography>
            </Box>
            <IconButton onClick={toggleDarkMode} color="inherit" sx={{ position: 'absolute', right: 16 }}>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Loading Progress */}
        {loading && <LinearProgress />}

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* Stats Cards - 3 Cards Only, Horizontal Layout */}
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              {/* Total Flights */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 3,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <Box sx={{ mr: 3, fontSize: 48 }}>✈️</Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {statsLoading ? '...' : stats?.total_flights?.toLocaleString() || '0'}
                    </Typography>
                    <Typography variant="body1">Total Flights</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Total Airports */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 3,
                    bgcolor: 'secondary.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <Box sx={{ mr: 3, fontSize: 48 }}>🏛️</Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {statsLoading ? '...' : stats?.total_airports || '0'}
                    </Typography>
                    <Typography variant="body1">Total Airports</Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Average Delay */}
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 3,
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    color: 'white',
                  }}
                >
                  <Box sx={{ mr: 3, fontSize: 48 }}>⏱️</Box>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                      {statsLoading ? '...' : stats?.avg_delay_minutes?.toFixed(2) || '0.00'}
                    </Typography>
                    <Typography variant="body1">Avg Delay (min)</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Tabbed Query Interface */}
          <Box sx={{ mb: 4 }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Predefined Queries" />
              <Tab label="Custom SQL Query" />
            </Tabs>

            {/* Tab 1: Predefined Queries */}
            {tabValue === 0 && (
              <PredefinedQueries
                queries={predefinedQueries}
                onExecute={handleExecutePredefinedQuery}
                loading={warehouseLoading || normalizedLoading}
              />
            )}

            {/* Tab 2: Custom SQL Query */}
            {tabValue === 1 && (
              <QueryEditor
                onExecute={handleComparisonQuery}
                loading={warehouseLoading || normalizedLoading}
              />
            )}
          </Box>

          {/* Comparison Results - Side by Side */}
          {(comparisonResults || warehouseLoading || normalizedLoading) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Query Results - Database Comparison
              </Typography>

              {/* Performance Comparison Banner - Only show when both results are available */}
              {comparisonResults && comparisonResults.comparison && (
                <Box
                  sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: 'success.light',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6">
                    ⚡ Speedup: <strong>{comparisonResults.comparison.speedup}×</strong>
                  </Typography>
                  <Typography variant="h6">
                    📈 Improvement: <strong>{comparisonResults.comparison.improvement_pct}%</strong>
                  </Typography>
                  <Typography variant="h6">
                    ⏱️ Time Saved: <strong>{comparisonResults.comparison.time_saved_ms.toFixed(0)} ms</strong>
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2}>
                {/* Left: Warehouse Results */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: 2, borderColor: 'success.main', borderRadius: 2, p: 2, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom color="success.main">
                      ⚡ Data Warehouse (Star Schema)
                    </Typography>
                    {comparisonResults && comparisonResults.warehouse && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={`${comparisonResults.warehouse.execution_time_ms} ms`}
                          color="primary"
                        />
                        <Chip
                          icon={<TableRowsIcon />}
                          label={`${comparisonResults.warehouse.row_count} rows`}
                          color="secondary"
                        />
                        <Chip icon={<CheckCircleIcon />} label="Success" color="success" />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      {warehouseLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : comparisonResults && comparisonResults.warehouse ? (
                        <ResultsTable
                          results={comparisonResults.warehouse.data}
                          queryMetrics={{
                            execution_time_ms: comparisonResults.warehouse.execution_time_ms,
                            row_count: comparisonResults.warehouse.row_count,
                            columns: comparisonResults.warehouse.columns,
                          }}
                        />
                      ) : null}
                    </Box>
                  </Box>
                </Grid>

                {/* Right: Normalized Results */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: 2, borderColor: 'warning.main', borderRadius: 2, p: 2, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom color="warning.main">
                      🐌 Normalized Database (3NF)
                    </Typography>
                    {comparisonResults && comparisonResults.normalized && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<AccessTimeIcon />}
                          label={`${comparisonResults.normalized.execution_time_ms} ms`}
                          color="primary"
                        />
                        <Chip
                          icon={<TableRowsIcon />}
                          label={`${comparisonResults.normalized.row_count} rows`}
                          color="secondary"
                        />
                        <Chip icon={<CheckCircleIcon />} label="Success" color="success" />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, overflow: 'auto' }}>
                      {normalizedLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                          <CircularProgress />
                        </Box>
                      ) : comparisonResults && comparisonResults.normalized ? (
                        <ResultsTable
                          results={comparisonResults.normalized.data}
                          queryMetrics={{
                            execution_time_ms: comparisonResults.normalized.execution_time_ms,
                            row_count: comparisonResults.normalized.row_count,
                            columns: comparisonResults.normalized.columns,
                          }}
                        />
                      ) : null}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
