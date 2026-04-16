import { useState, useEffect } from 'react';
import './MarketTicker.css';
import { fetchMarketData, fetchMarketHistory } from '../../api/marketApi';

const displaySymbol = (value) => String(value || '').replace(/\.(NS|BO)$/i, '');
const formatPercent = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0.00%';
  return `${numeric > 0 ? '+' : ''}${numeric.toFixed(2)}%`;
};

const normalizeTickerRow = (item) => {
  const price = Number(item?.price || item?.ltp || item?.lastPrice || 0);
  const change = Number(item?.changePercent ?? item?.change_24h ?? item?.change ?? 0);
  return {
    symbol: displaySymbol(item?.symbol || item?.name).substring(0, 14),
    price: Number.isFinite(price) ? price.toLocaleString() : '0',
    change: Number.isFinite(change) ? change : 0,
  };
};

const BENCHMARK_INDEXES = [
  { label: 'NIFTY 50', backendSymbol: '^NSEI' },
  { label: 'BANKNIFTY', backendSymbol: '^NSEBANK' },
  { label: 'SENSEX', backendSymbol: '^BSESN' },
];

const getBenchmarksFromHistory = async () => {
  const settled = await Promise.allSettled(
    BENCHMARK_INDEXES.map(async (item) => {
      const response = await fetchMarketHistory(item.backendSymbol, 'STOCK', '1D');
      const points = Array.isArray(response?.data) ? response.data : [];
      const current = Number(points[points.length - 1]?.close || 0);
      const previous = Number(points[points.length - 2]?.close || 0);

      if (!Number.isFinite(current) || current <= 0 || !Number.isFinite(previous) || previous <= 0) {
        return null;
      }

      const change = ((current - previous) / previous) * 100;
      return {
        symbol: item.label,
        price: current.toLocaleString(undefined, { maximumFractionDigits: 2 }),
        change: Number.isFinite(change) ? change : 0,
      };
    })
  );

  return settled
    .filter((entry) => entry.status === 'fulfilled')
    .map((entry) => entry.value)
    .filter(Boolean);
};

const rotateRows = (rows, count, offset) => {
  if (!Array.isArray(rows) || rows.length === 0 || count <= 0) {
    return [];
  }

  if (rows.length <= count) {
    return rows.slice(0, count);
  }

  const start = offset % rows.length;
  const ordered = [...rows.slice(start), ...rows.slice(0, start)];
  return ordered.slice(0, count);
};

const MarketTicker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const [stocks, setStocks] = useState([
    { symbol: 'HDFCBANK', price: '1,650', change: 0.48 },
    { symbol: 'INFY', price: '1,420', change: -0.21 },
    { symbol: 'TCS', price: '3,845', change: 0.92 },
    { symbol: 'NIFTY 50', price: '18,500', change: 0.52 },
    { symbol: 'BANKNIFTY', price: '44,200', change: 0.35 },
  ]);

  const [error, setError] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        if (isMounted) {
          setError(false);
          setIsLoading(true);
        }
        const res = await fetchMarketData({ type: 'STOCK', sort: 'gainers' });
        const [benchmarks, movers] = await Promise.all([
          getBenchmarksFromHistory(),
          Promise.resolve(
            (Array.isArray(res) ? res : [])
              .map((item) => normalizeTickerRow(item))
              .filter((item) => item.symbol)
          ),
        ]);

        const benchmarkSymbols = new Set(benchmarks.map((item) => item.symbol));
        const cleanMovers = movers.filter((item) => !benchmarkSymbols.has(item.symbol));
        const rotatingMovers = rotateRows(cleanMovers, Math.max(0, 12 - benchmarks.length), rotationOffset);
        const mergedRows = [...benchmarks, ...rotatingMovers];

        if (mergedRows.length > 0 && isMounted) {
          setStocks(mergedRows);
          setLastUpdatedAt(new Date());
          setRotationOffset((prev) => prev + 1);
        }
      } catch (err) {
          console.error("Ticker fetch failed:", err);
          if (isMounted) {
            setError(true);
          }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    const intervalId = setInterval(load, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const lastUpdateText = lastUpdatedAt
    ? lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="market-ticker-shell">
      <div className="market-ticker-container">
        <div className="ticker-left-status">
          <span className={`ticker-status-dot ${error ? 'offline' : 'live'}`}></span>
          <div className="ticker-status-copy">
            <span className="ticker-status-text">{error ? 'Feed Offline' : isLoading ? 'Syncing' : 'Live Market'}</span>
            <span className="ticker-status-time">Updated {lastUpdateText}</span>
          </div>
        </div>

        <div className="ticker-center-scroll-wrap">
          <div className="ticker-center-fade ticker-center-fade--left" aria-hidden="true"></div>
          <div className="ticker-wrapper-track" role="list" aria-label="Market ticker">
          {error && (
            <div className="ticker-banner">Fallback feed active</div>
          )}
          {stocks.map((s, idx) => (
            <div className="ticker-item-simple" key={`${s.symbol}-${idx}`} role="listitem">
              <span className="ticker-sym">{s.symbol}</span>
              <div className="ticker-item-right">
                <span className="ticker-val">{s.price}</span>
                <span className={`ticker-chg ${s.change >= 0 ? 'up' : 'down'}`}>
                  {formatPercent(s.change)}
                </span>
              </div>
            </div>
          ))}
          </div>
          <div className="ticker-center-fade ticker-center-fade--right" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
};

export default MarketTicker;
