// API Integration Helpers for Advanced Watchlist Dashboard
// Use these utilities to connect the dashboard to your backend

import axios from 'axios';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const STOCKS_ENDPOINT = `${API_BASE_URL}/stocks`;
const WATCHLIST_ENDPOINT = `${API_BASE_URL}/watchlist`;
const ALERTS_ENDPOINT = `${API_BASE_URL}/alerts`;

// ============================================================================
// STOCK DATA APIs
// ============================================================================

/**
 * Fetch all stocks for watchlist
 * @returns {Promise<Array>} Array of stock objects
 */
export const fetchStocks = async () => {
  try {
    const response = await axios.get(STOCKS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    throw error;
  }
};

/**
 * Fetch single stock details
 * @param {string} symbol - Stock symbol (e.g., 'RELIANCE')
 * @returns {Promise<Object>} Stock details object
 */
export const fetchStockDetails = async (symbol) => {
  try {
    const response = await axios.get(`${STOCKS_ENDPOINT}/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch stock OHLC (Open, High, Low, Close) data for charts
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Time interval ('1m', '5m', '15m', '1h', '1d', etc.)
 * @param {number} limit - Number of candles to fetch
 * @returns {Promise<Array>} OHLC data array
 */
export const fetchOHLCData = async (symbol, interval = '1d', limit = 100) => {
  try {
    const response = await axios.get(`${STOCKS_ENDPOINT}/${symbol}/ohlc`, {
      params: { interval, limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching OHLC data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch real-time price updates via WebSocket
 * @param {Array<string>} symbols - Array of stock symbols to track
 * @param {Function} onUpdate - Callback function when price updates
 * @returns {WebSocket} WebSocket instance for cleanup
 */
export const subscribeToLivePrices = (symbols, onUpdate) => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsURL = `${wsProtocol}//${window.location.host}/api/ws/prices`;

  const ws = new WebSocket(wsURL);

  ws.onopen = () => {
    // Subscribe to symbols
    ws.send(
      JSON.stringify({
        type: 'subscribe',
        symbols: symbols,
      })
    );
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onUpdate(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
};

// ============================================================================
// ORDER/TRADING APIs
// ============================================================================

/**
 * Place a buy/sell order
 * @param {Object} orderData - Order details
 * @param {string} orderData.symbol - Stock symbol
 * @param {number} orderData.quantity - Number of shares
 * @param {string} orderData.side - 'buy' or 'sell'
 * @param {number} orderData.price - Limit price (optional for market orders)
 * @param {string} orderData.type - 'market' or 'limit'
 * @returns {Promise<Object>} Order confirmation
 */
export const placeOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

/**
 * Fetch order book data for a stock
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Order book with bids and asks
 */
export const fetchOrderBook = async (symbol) => {
  try {
    const response = await axios.get(`${STOCKS_ENDPOINT}/${symbol}/orderbook`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order book for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch recent trades for a stock
 * @param {string} symbol - Stock symbol
 * @param {number} limit - Number of recent trades to fetch
 * @returns {Promise<Array>} Recent trade data
 */
export const fetchRecentTrades = async (symbol, limit = 50) => {
  try {
    const response = await axios.get(
      `${STOCKS_ENDPOINT}/${symbol}/trades`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching trades for ${symbol}:`, error);
    throw error;
  }
};

// ============================================================================
// WATCHLIST MANAGEMENT APIs
// ============================================================================

/**
 * Fetch user's watchlist
 * @returns {Promise<Array>} User's watchlist items
 */
export const fetchUserWatchlist = async () => {
  try {
    const response = await axios.get(WATCHLIST_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    throw error;
  }
};

/**
 * Add stock to watchlist
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Updated watchlist
 */
export const addToWatchlist = async (symbol) => {
  try {
    const response = await axios.post(WATCHLIST_ENDPOINT, { symbol });
    return response.data;
  } catch (error) {
    console.error(`Error adding ${symbol} to watchlist:`, error);
    throw error;
  }
};

/**
 * Remove stock from watchlist
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Updated watchlist
 */
export const removeFromWatchlist = async (symbol) => {
  try {
    const response = await axios.delete(`${WATCHLIST_ENDPOINT}/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing ${symbol} from watchlist:`, error);
    throw error;
  }
};

// ============================================================================
// ALERT MANAGEMENT APIs
// ============================================================================

/**
 * Create a price alert
 * @param {Object} alertData - Alert configuration
 * @param {string} alertData.symbol - Stock symbol
 * @param {number} alertData.price - Target price
 * @param {string} alertData.condition - 'above' or 'below'
 * @param {string} alertData.message - Alert message
 * @returns {Promise<Object>} Created alert
 */
export const createAlert = async (alertData) => {
  try {
    const response = await axios.post(ALERTS_ENDPOINT, alertData);
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

/**
 * Fetch all user alerts
 * @returns {Promise<Array>} User's alerts
 */
export const fetchAlerts = async () => {
  try {
    const response = await axios.get(ALERTS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

/**
 * Delete an alert
 * @param {string} alertId - Alert ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteAlert = async (alertId) => {
  try {
    const response = await axios.delete(`${ALERTS_ENDPOINT}/${alertId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting alert ${alertId}:`, error);
    throw error;
  }
};

// ============================================================================
// NEWS INTEGRATION APIs
// ============================================================================

/**
 * Fetch news for a stock
 * @param {string} symbol - Stock symbol
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} News articles
 */
export const fetchNewsForStock = async (symbol, limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news/${symbol}`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetch market/sector news
 * @param {number} limit - Number of articles to fetch
 * @returns {Promise<Array>} Market news articles
 */
export const fetchMarketNews = async (limit = 20) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/news`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
};

// ============================================================================
// ANALYTICS/SCREENING APIs
// ============================================================================

/**
 * Screen stocks based on criteria
 * @param {Object} criteria - Screening criteria
 * @param {number} criteria.minPrice - Minimum stock price
 * @param {number} criteria.maxPrice - Maximum stock price
 * @param {number} criteria.minVolume - Minimum trading volume
 * @param {number} criteria.minRSI - Minimum RSI value
 * @param {number} criteria.maxRSI - Maximum RSI value
 * @returns {Promise<Array>} Screened stocks
 */
export const screenStocks = async (criteria) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/screener`, criteria);
    return response.data;
  } catch (error) {
    console.error('Error screening stocks:', error);
    throw error;
  }
};

/**
 * Get top gainers
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Top gaining stocks
 */
export const fetchTopGainers = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/gainers`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    throw error;
  }
};

/**
 * Get top losers
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Top losing stocks
 */
export const fetchTopLosers = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/losers`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top losers:', error);
    throw error;
  }
};

/**
 * Get high volume stocks
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} High volume stocks
 */
export const fetchHighVolumeStocks = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/high-volume`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching high volume stocks:', error);
    throw error;
  }
};

// ============================================================================
// USAGE EXAMPLES IN COMPONENTS
// ============================================================================

/*

// Example 1: Load watchlist in AdvancedWatchlistDashboard.jsx
import { fetchStocks, subscribeToLivePrices } from '@/services/api';

useEffect(() => {
  // Fetch initial data
  fetchStocks().then(data => {
    setStocks(data);
    
    // Subscribe to live prices
    const symbols = data.map(stock => stock.symbol);
    const ws = subscribeToLivePrices(symbols, (update) => {
      setStocks(prev =>
        prev.map(stock =>
          stock.symbol === update.symbol
            ? { ...stock, price: update.price, change: update.change }
            : stock
        )
      );
    });
    
    return () => ws.close();
  });
}, []);

// Example 2: Handle order submission in StockDetailsPanel.jsx
import { placeOrder } from '@/services/api';

const handleBuyOrder = async () => {
  try {
    const order = await placeOrder({
      symbol: stock.symbol,
      quantity: orderQuantity,
      side: 'buy',
      type: 'market',
    });
    showSuccessMessage(`Order placed: ${order.id}`);
  } catch (error) {
    showErrorMessage('Failed to place order');
  }
};

// Example 3: Create price alert
import { createAlert } from '@/services/api';

const handleSetAlert = async (pricePoint) => {
  try {
    const alert = await createAlert({
      symbol: stock.symbol,
      price: pricePoint,
      condition: 'above',
      message: `${stock.symbol} reached ${pricePoint}`,
    });
    showSuccessMessage('Alert created');
  } catch (error) {
    showErrorMessage('Failed to create alert');
  }
};

*/

export default {
  // Stock APIs
  fetchStocks,
  fetchStockDetails,
  fetchOHLCData,
  subscribeToLivePrices,

  // Trading APIs
  placeOrder,
  fetchOrderBook,
  fetchRecentTrades,

  // Watchlist APIs
  fetchUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,

  // Alert APIs
  createAlert,
  fetchAlerts,
  deleteAlert,

  // News APIs
  fetchNewsForStock,
  fetchMarketNews,

  // Screening APIs
  screenStocks,
  fetchTopGainers,
  fetchTopLosers,
  fetchHighVolumeStocks,
};
