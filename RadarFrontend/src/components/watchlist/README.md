# Advanced Trading Watchlist Dashboard UI

A production-ready, professional trading watchlist dashboard built with React, Tailwind CSS, and Framer Motion. Features glassmorphism design, real-time data simulation, advanced filtering, and interactive stock details.

## Features

### Core Components

1. **AdvancedWatchlistDashboard** - Main container component
   - Portfolio summary cards
   - Search and filter controls
   - Tab-based filtering (All, Gainers, Losers, High Volume, Breakouts)
   - Real-time stock simulation (updates every 3 seconds)

2. **WatchlistTable** - Advanced data table
   - 11+ sortable columns (Symbol, Price, Change, Volume, RSI, MACD, etc.)
   - Column visibility toggle
   - Sticky header with scrollable body
   - Inline sparkline charts for each stock
   - Row selection with status highlighting
   - Quick alert button for each row
   - Hover animations and glow effects

3. **StockDetailsPanel** - Right-side drawer
   - Real-time stock stats (RSI, VWAP, 52W High/Low)
   - Tabbed interface:
     - **Chart**: Price movement and volume analysis (Recharts)
     - **Order Book**: Live bids and asks with visual depth
     - **Trades**: Recent trade history
     - **News**: Sentiment-based news feed
   - Buy/Sell ordering interface
   - Price alert setup

4. **FilterModal** - Advanced filtering
   - Price range slider
   - Minimum volume filter
   - RSI range filter with presets (Oversold/Overbought)
   - Apply/Reset functionality
   - Smooth expand/collapse animations

5. **PortfolioSummary** - Top summary bar
   - Total portfolio value
   - Daily P&L (Profit & Loss)
   - Top gainer/loser highlights
   - Sector allocation donut chart

6. **AlertsPanel** - Notification system
   - Fixed floating bell icon in bottom-right
   - Toast-style alert display
   - Dismissible alerts
   - Alert counter badge
   - Real-time timestamp

## Installation

### 1. Install Dependencies

```bash
npm install framer-motion recharts react-sparklines
```

### 2. Import Components

```jsx
import { AdvancedWatchlistDashboard } from '@/components/watchlist';
```

### 3. Use in Your App

```jsx
import React from 'react';
import { AdvancedWatchlistDashboard } from '@/components/watchlist';

function App() {
  return (
    <div>
      <AdvancedWatchlistDashboard />
    </div>
  );
}

export default App;
```

## Component Structure

```
watchlist/
├── AdvancedWatchlistDashboard.jsx  (Main container)
├── WatchlistTable.jsx              (Data table with sparklines)
├── StockDetailsPanel.jsx           (Right-side details drawer)
├── FilterModal.jsx                 (Advanced filters modal)
├── PortfolioSummary.jsx            (Top summary cards)
├── AlertsPanel.jsx                 (Toast notifications)
├── index.js                         (Barrel export)
└── README.md                        (This file)
```

## Column Visibility Toggle

Click the eye icon (👁️) in the controls bar to manage which columns display:

- Symbol
- Price
- Change (absolute)
- % Change
- Volume
- Market Cap
- RSI
- MACD
- 52W High
- 52W Low
- VWAP

## Filtering

### Tab Filters
- **All**: Display all stocks
- **Gainers**: Positive change only
- **Losers**: Negative change only
- **High Volume**: Volume > 2M
- **Breakouts**: Special status indicator

### Advanced Filters
Click "Filters" to open modal:
- **Price Range**: Min-max slider (₹0-5000)
- **Volume**: Minimum volume threshold
- **RSI**: Range selector with Oversold/Overbought presets
- Press "Apply Filters" to update table
- Press "Reset" to clear all filters

## Real-Time Updates

The dashboard simulates real-time updates every 3 seconds:
- Price changes ±0.5%
- Volume fluctuations
- Change percentage updates

To integrate with real WebSocket data, replace the `setInterval` in `AdvancedWatchlistDashboard.jsx`:

```jsx
// Replace this:
useEffect(() => {
  const interval = setInterval(() => {
    setStocks((prev) =>
      prev.map((stock) => ({
        ...stock,
        price: stock.price * (1 + (Math.random() - 0.5) * 0.01),
        // ...
      }))
    );
  }, 3000);
  return () => clearInterval(interval);
}, []);

// With your WebSocket handler:
useEffect(() => {
  const ws = new WebSocket('your-websocket-url');
  ws.onmessage = (event) => {
    const updatedStocks = JSON.parse(event.data);
    setStocks(updatedStocks);
  };
  return () => ws.close();
}, []);
```

## Customization

### Theme Colors

The dashboard uses Tailwind CSS with custom color scheme:

- **Primary**: Blue (`#3b82f6`)
- **Success**: Emerald (`#10b981`)
- **Danger**: Rose (`#f43f5e`)
- **Accent**: Purple (`#8b5cf6`)
- **Background**: Slate (`#1e293b`, `#0f172a`)

To customize, modify the class names in each component.

### Add More Columns

To add columns to the table, update the `columns` array in `WatchlistTable.jsx`:

```jsx
const columns = [
  // ... existing columns
  { key: 'customField', label: 'Custom', width: 'w-24' },
];
```

Then add visibility toggle in `AdvancedWatchlistDashboard.jsx`:

```jsx
const [columnVisibility, setColumnVisibility] = useState({
  // ... existing columns
  customField: true,
});
```

### Mock Data

Replace `MOCK_STOCKS` in `AdvancedWatchlistDashboard.jsx` with real API data:

```jsx
useEffect(() => {
  fetchStocks().then(setStocks);
}, []);
```

## API Integration

### Fetch Real Stock Data

```jsx
// In AdvancedWatchlistDashboard.jsx
useEffect(() => {
  async function loadStocks() {
    const response = await fetch('/api/stocks');
    const data = await response.json();
    setStocks(data);
  }
  loadStocks();
}, []);
```

### Buy/Sell Orders

Implement order submission in `StockDetailsPanel.jsx`:

```jsx
const handleBuyOrder = async () => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      symbol: stock.symbol,
      quantity: orderQuantity,
      side: 'buy',
      price: stock.price,
    }),
  });
  // Handle response
};
```

## Performance Optimization

### Large Lists (1000+ stocks)

```jsx
import { FixedSizeList } from 'react-window';

// Wrap table body with virtualization for better performance
```

### Debounce Search

```jsx
import { debounce } from 'lodash';

const handleSearch = debounce((query) => {
  setSearchQuery(query);
}, 300);
```

## Browser Support

- Chrome/Edge: ✅ Latest
- Firefox: ✅ Latest
- Safari: ✅ Latest 2 versions
- Mobile: ✅ iOS Safari, Chrome Mobile

## Dependencies

- **React**: ^18.0.0
- **Framer Motion**: ^10.0.0 (Animations)
- **Recharts**: ^2.0.0 (Charts)
- **Tailwind CSS**: ^3.0.0 (Styling)
- **Lucide React**: ^0.255.0 (Icons)
- **React Sparklines**: ^1.7.0 (Mini charts)

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- High contrast text
- Focus indicators
- Screen reader friendly

## Known Limitations

1. Mock data doesn't persist across page reloads
2. Charts use sample data (connect to real API)
3. Order book data is simulated
4. Recent trades are mock data

## Future Enhancements

- [ ] Export watchlist to CSV
- [ ] Save custom filter views
- [ ] Dark/Light theme toggle
- [ ] Multi-symbol comparison view
- [ ] Technical analysis indicators overlay
- [ ] Backtest functionality
- [ ] Alert history/logs
- [ ] Mobile-responsive optimizations

## License

MIT License - Feel free to use in commercial projects

## Support

For issues or feature requests, create an issue in your project repository.
