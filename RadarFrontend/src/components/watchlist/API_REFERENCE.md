// Component API Reference
// Complete documentation of all props, state, and methods

// ============================================================================
// AdvancedWatchlistDashboard (Main Container)
// ============================================================================

/*
COMPONENT: AdvancedWatchlistDashboard
File: AdvancedWatchlistDashboard.jsx
Purpose: Main orchestration component managing all watchlist state and filters

PROPS (Optional - uses internal mock data by default):
  initialStocks?: Array<Stock>
    - Initial stock data to load
    - Default: MOCK_STOCKS (6 stocks)
    
  onSelectStock?: Function(stock: Stock)
    - Callback when user clicks a stock row
    - Signature: (stock) => void
    
  onAddAlert?: Function(stock: Stock, pricePoint: number)
    - Callback when user adds price alert
    - Signature: (stock, price) => void
    
  onBuyOrder?: Function(order: Order)
    - Callback when user places buy order
    - Signature: (order) => void

STATE:
  stocks: Array<Stock>
    - Current stock data with prices, changes, volumes, etc.
    - Updates every 3 seconds with simulated prices
    - Structure: { symbol, price, change, changePercent, volume, marketCap, rsi, macd, high52, low52, vwap }
    
  selectedStock: Stock | null
    - Currently selected stock for details panel
    
  searchQuery: string
    - Current search filter text
    
  filterTab: 'all' | 'gainers' | 'losers' | 'highVolume' | 'breakouts'
    - Active filter tab
    
  sortConfig: { column: string, order: 'asc' | 'desc' }
    - Sort configuration for table columns
    
  filters: { priceRange, minVolume, rsiRange }
    - Advanced filter values
    
  columnVisibility: { [key: string]: boolean }
    - Which columns should display in table
    
  alerts: Array<Alert>
    - User's active price alerts
    - Structure: { id, symbol, price, timestamp, message }
    
  dismissedAlerts: Set<string>
    - Alert IDs that have been dismissed

KEY METHODS:
  setStocks(stocks)
    - Update stock data
    
  setSelectedStock(stock)
    - Select a stock for details panel
    
  setSearchQuery(query)
    - Update search filter
    
  setFilterTab(tab)
    - Change active filter tab
    
  setSortConfig(column, order)
    - Update table sort
    
  setFilters(filters)
    - Update advanced filters
    
  toggleColumnVisibility(column)
    - Toggle column on/off
    
  addAlert(stock, pricePoint)
    - Create new price alert

COMPUTED DATA (useMemo):
  filteredStocks
    - Result of applying search, tabs, and advanced filters
    - Recalculates only when dependencies change

EFFECTS:
  - Real-time price simulation (setInterval every 3 seconds)
  - Cleanup on component unmount

EXAMPLE USAGE:
  <AdvancedWatchlistDashboard
    initialStocks={myStocks}
    onSelectStock={(stock) => console.log(stock)}
    onAddAlert={(stock, price) => createAlert(stock, price)}
  />
*/

// ============================================================================
// WatchlistTable (Data Grid Component)
// ============================================================================

/*
COMPONENT: WatchlistTable
File: WatchlistTable.jsx
Purpose: Renders scrollable stock data table with sorting and animations

PROPS:
  stocks: Array<Stock> (Required)
    - Stock data to display
    
  selectedStock?: Stock
    - Currently selected stock (highlights row)
    
  onSelectStock?: Function(stock: Stock)
    - Callback when user clicks a stock row
    
  onAddAlert?: Function(stock: Stock)
    - Callback when user clicks alert button
    
  sortConfig?: { column: string, order: 'asc' | 'desc' }
    - Current sort state
    
  onSortChange?: Function(column: string)
    - Callback when user clicks column header to sort
    
  columnVisibility?: { [key: string]: boolean }
    - Which columns should be visible
    
  isLoading?: boolean
    - Show loading skeleton (default: false)

COLUMNS (11 total):
  symbol      - Stock ticker symbol
  price       - Current price (formatted with ₹)
  change      - Absolute price change
  changePercent - Percentage change (color-coded: green>0, red<0)
  volume      - Trading volume (formatted with M for millions)
  marketCap   - Market capitalization
  rsi         - Relative Strength Index (0-100, color-coded)
  macd        - MACD status (Bullish/Bearish/Neutral)
  high52      - 52-week high price
  low52       - 52-week low price
  vwap        - Volume Weighted Average Price

STYLING:
  Container: "overflow-y-auto max-h-[calc(100vh-450px)]"
  Header: "sticky top-0 z-10 backdrop-blur-xl"
  Row: "hover:bg-slate-700/30 border-l-4 border-l-transparent"
  Selected Row: "bg-blue-900/20 border-l-4 border-l-blue-400"

FEATURES:
  - Inline sparkline charts (30-point data)
  - Price animation on update
  - RSI color coding (red >70, green <30)
  - MACD status badges
  - Row hover effects with glow
  - Alert button on each row
  - Empty state handling

EXAMPLE USAGE:
  <WatchlistTable
    stocks={stocks}
    selectedStock={selectedStock}
    onSelectStock={setSelectedStock}
    columnVisibility={columnVisibility}
    onAddAlert={handleAddAlert}
  />
*/

// ============================================================================
// StockDetailsPanel (Right Drawer)
// ============================================================================

/*
COMPONENT: StockDetailsPanel
File: StockDetailsPanel.jsx
Purpose: Right-side drawer showing detailed info for selected stock

PROPS:
  stock: Stock (Required)
    - Stock object with full data
    
  isOpen?: boolean (Required)
    - Whether panel should be visible
    
  onClose?: Function() (Required)
    - Callback to close panel
    
  onBuyOrder?: Function(order: Order)
    - Callback when user places buy order
    
  onSellOrder?: Function(order: Order)
    - Callback when user places sell order
    
  onSetAlert?: Function(alertData: AlertData)
    - Callback when user sets price alert

STATE:
  activeTab: 'chart' | 'orderbook' | 'trades' | 'news'
    - Current tab view
    
  orderQuantity: number
    - Number of shares for order
    
  chartData: Array<PricePoint>
    - Historical price data for chart
    
  orderBook: { bids: Array, asks: Array }
    - Current order book data
    
  recentTrades: Array<Trade>
    - Recent trade history
    
  news: Array<NewsArticle>
    - Stock-related news

TABS:
  Chart Tab:
    - Area chart (price movement) with AreaChart
    - Volume bars with ComposedChart
    - Responsive height (200px area, 120px volume)
    - Candlestick data simulation
    
  Order Book Tab:
    - Bid/Ask list with quantities
    - Visual depth indicator (percentage bars)
    - Bid-Ask spread display
    - Color coding (green bids, red asks)
    
  Trades Tab:
    - Recent trade list
    - Timestamp, price, quantity
    - Buy/sell indicators (green/red)
    - Real-time updates
    
  News Tab:
    - News cards with sentiment
    - Positive (green), Neutral (gray), Negative (red)
    - Headline and source
    - publish timestamp

KEY STATS (Always Visible):
  - RSI value with color
  - VWAP price
  - 52W High/Low
  - Current spread

TRADING INTERFACE:
  Quantity Input:
    - Number input for share quantity
    - Default: 1
    
  Buy/Sell Buttons:
    - Green for buy, red for sell
    - Disabled if quantity is 0
    
  Set Price Alert:
    - Opens price alert configuration
    - Price threshold input
    - Condition (above/below)

STYLING:
  Panel: "fixed right-0 top-0 h-screen w-96 bg-slate-900 border-l border-slate-700"
  Animations: "spring entrance from right { type: 'spring', damping: 25 }"

EXAMPLE USAGE:
  <StockDetailsPanel
    stock={selectedStock}
    isOpen={selectedStock !== null}
    onClose={() => setSelectedStock(null)}
    onBuyOrder={handleBuyOrder}
    onSetAlert={handleSetAlert}
  />
*/

// ============================================================================
// FilterModal (Advanced Filters)
// ============================================================================

/*
COMPONENT: FilterModal
File: FilterModal.jsx
Purpose: Modal interface for advanced stock filtering

PROPS:
  isOpen: boolean (Required)
    - Whether modal is visible
    
  onClose: Function() (Required)
    - Callback to close modal
    
  onApply: Function(filters: FilterConfig) (Required)
    - Callback when filters are applied
    
  currentFilters?: FilterConfig
    - Initial filter values

STATE:
  localFilters: {
    priceRange: [min, max],
    minVolume: number,
    rsiRange: [min, max],
    macdStatus?: string
  }
    - Current local filter values

FILTER SECTIONS:

  Price Range:
    - Slider from ₹0 to ₹5000
    - Dual inputs for min/max
    - Step: 100
    
  Volume:
    - Slider 0 to 10M
    - Preset buttons: 1M, 5M, 10M
    - Step: 100K
    
  RSI:
    - Slider 0 to 100
    - Dual inputs for range
    - Shortcuts: Oversold (<30), Overbought (>70)
    
  MACD (Optional):
    - Dropdown: Bullish, Bearish, Neutral

ANIMATIONS:
  - Expandable sections with smooth height animation
  - Modal entrance: fadeinScale effect
  - Smooth slider interactions

BUTTONS:
  Apply
    - Apply filters and close modal
    
  Reset
    - Clear all filters to defaults
    
  Cancel
    - Close without applying

EXAMPLE USAGE:
  <FilterModal
    isOpen={showFilters}
    onClose={() => setShowFilters(false)}
    onApply={(filters) => setFilters(filters)}
    currentFilters={filters}
  />
*/

// ============================================================================
// PortfolioSummary (Summary Stats Bar)
// ============================================================================

/*
COMPONENT: PortfolioSummary
File: PortfolioSummary.jsx
Purpose: Top summary bar showing portfolio overview and sector breakdown

PROPS:
  stocks: Array<Stock> (Required)
    - Stock data for calculations
    
  isLoading?: boolean
    - Show skeleton loading (default: false)

STATE:
  Computed from stocks:
    - totalValue: sum of all stock prices
    - totalChange: sum of all changes
    - totalChangePercent: average change percent
    - topGainer: stock with highest % change
    - topLoser: stock with lowest % change
    - sectorAllocation: breakdown by sector

CARDS (5 total):
  1. Portfolio Value
     - Display: ₹X.XX | X% of total
     - Icon: TrendingUp
     - Color: Blue gradient background
     
  2. Daily P&L
     - Display: +/-₹X.XX | +/-X%
     - Color: Green if positive, Red if negative
     - Icon: Activity
     
  3. Top Gainer
     - Display: Symbol | +X% change
     - Icon: TrendingUp
     - Color: Emerald green
     
  4. Top Loser
     - Display: Symbol | -X% change
     - Icon: TrendingDown
     - Color: Rose red
     
  5. Sector Mix
     - Donut chart with 5 sectors
     - Colors: Different for each sector
     - Legend with percentages

GRID LAYOUT:
  Desktop: grid-cols-5
  Tablet: grid-cols-2/ 3
  Mobile: grid-cols-1

ANIMATIONS:
  - Staggered entrance (containerVariants with staggerChildren)
  - Scale on hover
  - Number animation

EXAMPLE USAGE:
  <PortfolioSummary
    stocks={stocks}
    isLoading={isLoadingStocks}
  />
*/

// ============================================================================
// AlertsPanel (Notification System)
// ============================================================================

/*
COMPONENT: AlertsPanel
File: AlertsPanel.jsx
Purpose: Fixed floating alert notification system in bottom-right corner

PROPS:
  alerts: Array<Alert> (Required)
    - List of active alerts
    
  onDismiss?: Function(alertId: string)
    - Callback when alert is dismissed

STATE:
  dismissedAlerts: Set<string>
    - IDs of alerts that have been dismissed
    
  visibleAlerts: Computed
    - Filtered alerts (excluding dismissed)

ALERT STRUCTURE:
  {
    id: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
    icon?: Component,
    timestamp: Date,
    dismissible?: boolean
  }

STYLING:
  Position: "fixed bottom-6 right-6 z-50"
  Container: "max-h-80 overflow-y-auto"
  Alert Item: "bg-slate-800/90 border-l-4 backdrop-blur-md"
  
FEATURES:
  - Bell icon with badge counter
  - Toast-style animation
  - Auto-dismiss option
  - Manual dismiss button
  - Time formatting (HH:MM format in India timezone)
  - Color-coded by type (blue info, green success, yellow warning, red error)

ANIMATIONS:
  - Bell icon: spring scale animation on new alerts
  - Alert items: fade in/out
  - Item entrance: staggered with AnimatePresence

EXAMPLE USAGE:
  <AlertsPanel
    alerts={alerts}
    onDismiss={(id) => dismissAlert(id)}
  />
*/

// ============================================================================
// Data Types/Interfaces
// ============================================================================

/*
Stock {
  symbol: string           // e.g., "RELIANCE"
  price: number           // Current price
  change: number          // Price change (absolute)
  changePercent: number   // Percentage change
  volume: number          // Trading volume
  marketCap: number       // Market capitalization
  rsi: number             // 0-100 RSI value
  macd: 'bullish' | 'bearish' | 'neutral'
  high52: number          // 52-week high
  low52: number           // 52-week low
  vwap: number            // Volume weighted avg price
  status?: 'breakout' | 'buy_signal' | 'sell_signal'
}

Alert {
  id: string | number
  symbol: string
  price: number
  condition: 'above' | 'below'
  message: string
  timestamp: Date
  triggered?: boolean
}

Order {
  symbol: string
  quantity: number
  side: 'buy' | 'sell'
  type: 'market' | 'limit'
  price?: number
  executionPrice?: number
  timestamp: Date
  status: 'pending' | 'executed' | 'cancelled'
}

FilterConfig {
  priceRange: [min: number, max: number]
  minVolume: number
  rsiRange: [min: number, max: number]
  macdStatus?: string
}

Trade {
  id: string
  symbol: string
  price: number
  quantity: number
  side: 'buy' | 'sell'
  timestamp: Date
}

NewsArticle {
  id: string
  title: string
  description: string
  source: string
  timestamp: Date
  sentiment: 'positive' | 'negative' | 'neutral'
  url?: string
}
*/

// ============================================================================
// STYLING CUSTOMIZATION
// ============================================================================

/*
COLORS & THEMES:

Default Theme (Dark):
  Background: bg-slate-950 (#0f172a)
  Surface: bg-slate-900 (#0f172a), bg-slate-800 (#1e293b)
  Border: border-slate-700 (#334155)
  Text: text-slate-50 (#f1f5f9)
  
  Semantic:
  Positive: emerald-500 (#10b981)
  Negative: rose-500 (#f43f5e)
  Neutral: slate-400 (#94a3b8)

Gradient Overrides:
  - from-blue-600 to-blue-900 (Blue accents)
  - from-emerald-600 to-emerald-900 (Green accents)
  - from-rose-600 to-rose-900 (Red accents)

To customize, update these class names in component files:
  - .bg-slate-950 ← Main background
  - .bg-slate-900 ← Card background
  - .border-slate-700 ← Borders
  - .text-emerald-500 ← Positive color
  - .text-rose-500 ← Negative color

*/

export default {};
