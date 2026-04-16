// Integration Guide for Advanced Trading Watchlist Dashboard
// This file shows how to integrate the watchlist components into your existing React app

// ============================================================================
// OPTION 1: Add as a New Route in Your Router
// ============================================================================

// In your Routes configuration file (e.g., src/App.jsx or src/routes/index.jsx):

import { AdvancedWatchlistDashboard } from '@/components/watchlist';
import TraderStockPage from '@/pages/TraderStockPage';

export const routes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    element: <AdvancedWatchlistDashboard />,
  },
  {
    path: '/stock/:symbol',
    name: 'Stock Details',
    element: <TraderStockPage />,
  },
  // ... other routes
];

// ============================================================================
// OPTION 2: Add as a Page Component
// ============================================================================

// Create: src/pages/WatchlistPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdvancedWatchlistDashboard } from '@/components/watchlist';

function WatchlistPage() {
  const navigate = useNavigate();

  const handleSelectStock = (stock) => {
    navigate(`/stock/${stock.symbol}`, { state: { stock } });
  };

  return (
    <div className="w-full h-screen bg-slate-950">
      <AdvancedWatchlistDashboard onSelectStock={handleSelectStock} />
    </div>
  );
}

export default WatchlistPage;

// Then in your Router:
// <Route path="/watchlist" element={<WatchlistPage />} />

// ============================================================================
// OPTION 3: Add to Existing Dashboard
// ============================================================================

// In your main Dashboard component (src/pages/Dashboard.jsx):

import React, { useState } from 'react';
import { AdvancedWatchlistDashboard } from '@/components/watchlist';
import Sidebar from '@/components/Sidebar';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('watchlist');

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {activeTab === 'watchlist' && <AdvancedWatchlistDashboard />}
        {activeTab === 'portfolio' && <PortfolioPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
      </main>
    </div>
  );
}

export default Dashboard;

// ============================================================================
// OPTION 4: Pass Real Data as Props (Advanced)
// ============================================================================

// Modified AdvancedWatchlistDashboard usage with custom data:

import React from 'react';
import { AdvancedWatchlistDashboard } from '@/components/watchlist';

function TraderDashboard() {
  const [stocks, setStocks] = React.useState([]);
  const [alerts, setAlerts] = React.useState([]);

  React.useEffect(() => {
    // Fetch from your backend
    const fetchStocks = async () => {
      const response = await fetch('/api/v1/stocks');
      const data = await response.json();
      setStocks(data);
    };

    fetchStocks();
  }, []);

  const handleAddAlert = (stock) => {
    const newAlert = {
      id: Date.now(),
      message: `Alert set for ${stock.symbol}`,
      timestamp: new Date(),
      type: 'info',
    };
    setAlerts([...alerts, newAlert]);
  };

  return (
    <AdvancedWatchlistDashboard
      initialStocks={stocks}
      onAddAlert={handleAddAlert}
      alerts={alerts}
    />
  );
}

export default TraderDashboard;

// ============================================================================
// STEP-BY-STEP INTEGRATION CHECKLIST
// ============================================================================

/*
Checklist for integrating the Watchlist Dashboard:

1. FILE STRUCTURE
   ☐ Verify watchlist components exist in src/components/watchlist/
   ☐ Confirm all imports in index.js barrel file
   ☐ Check component dependencies are installed (framer-motion, recharts, react-sparklines)

2. DEPENDENCIES
   ☐ Run: npm install framer-motion recharts react-sparklines
   ☐ Verify Tailwind CSS is configured with dark mode
   ☐ Confirm Lucide React icons are available

3. ROUTING
   ☐ Import AdvancedWatchlistDashboard in your router
   ☐ Add route: /watchlist or /trader-dashboard
   ☐ Add navigation link in sidebar/navbar

4. STYLING
   ☐ Apply consistent Tailwind config (dark theme)
   ☐ Test dark mode toggle if you have one
   ☐ Verify backdrop-blur and glass effects render correctly

5. TESTING
   ☐ Load the watchlist page in your browser
   ☐ Check real-time price updates trigger every 3 seconds
   ☐ Test tab filtering (All, Gainers, Losers, etc.)
   ☐ Verify column visibility toggle works
   ☐ Test filter modal opens and applies filters
   ☐ Click on a stock row to open details panel
   ☐ Test alerts appear in bottom-right corner

6. BACKEND INTEGRATION (Optional Next Steps)
   ☐ Replace MOCK_STOCKS with API endpoint
   ☐ Implement real WebSocket for price updates
   ☐ Connect order submission to backend
   ☐ Add persistent alert storage to database

*/

// ============================================================================
// EXAMPLE: Complete Integration in App.jsx
// ============================================================================

/*
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { AdvancedWatchlistDashboard } from './components/watchlist';
import TraderStockPage from './pages/TraderStockPage';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950 text-slate-50">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/watchlist" element={<AdvancedWatchlistDashboard />} />
              <Route path="/stock/:symbol" element={<TraderStockPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
*/

// ============================================================================
// EXAMPLE: Integration with State Management (Redux/Context)
// ============================================================================

/*
// Create: src/hooks/useWatchlist.js

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setStocks,
  addAlert,
  removeAlert,
  toggleFavorite,
} from '../store/watchlistSlice';

export const useWatchlist = () => {
  const dispatch = useDispatch();
  const stocks = useSelector((state) => state.watchlist.stocks);
  const alerts = useSelector((state) => state.watchlist.alerts);
  const favorites = useSelector((state) => state.watchlist.favorites);

  const handleAddAlert = useCallback(
    (stock, pricePoint) => {
      dispatch(
        addAlert({
          id: Date.now(),
          symbol: stock.symbol,
          pricePoint,
          timestamp: new Date(),
        })
      );
    },
    [dispatch]
  );

  const handleRemoveAlert = useCallback(
    (alertId) => {
      dispatch(removeAlert(alertId));
    },
    [dispatch]
  );

  return {
    stocks,
    alerts,
    favorites,
    onAddAlert: handleAddAlert,
    onRemoveAlert: handleRemoveAlert,
  };
};

// Then use in component:
// const { stocks, alerts, onAddAlert } = useWatchlist();
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Issue: Components not rendering
  → Check all imports in index.js barrel file
  → Verify component file names match exactly (case-sensitive)
  → Confirm all dependencies are installed

Issue: Tailwind styles not applying
  → Verify Tailwind CSS is properly configured
  → Check dark mode is enabled in tailwind.config.js
  → Clear .next or build cache and restart dev server

Issue: Icons not showing
  → Install lucide-react: npm install lucide-react
  → Check icon names are correct

Issue: Charts not rendering
  → Install recharts: npm install recharts
  → Verify ResponsiveContainer parent has height/width

Issue: Animations not smooth
  → Install framer-motion: npm install framer-motion
  → Check for CSS conflicts with global styles

Issue: Real-time updates not working
  → Verify setInterval is running (check browser console)
  → Check for JavaScript errors
  → Ensure state updates are triggering re-renders

*/

export default {};
