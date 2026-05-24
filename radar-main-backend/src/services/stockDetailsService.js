const YahooFinance = require('yahoo-finance2').default;
const normalizeStockData = require('../utils/normalizeStockData');

const yahooFinance = new YahooFinance();

const INDEX_MAP = {
  NIFTY: '^NSEI',
  SENSEX: '^BSESN',
  BANKNIFTY: '^NSEBANK'
};
const ABOUT_FALLBACKS = {
  'HDFCBANK.NS':
    'HDFC Bank is one of India’s largest private sector banks offering retail banking, wholesale banking, treasury operations, loans, credit cards, and digital banking services.',

  '^NSEI':
    'NIFTY 50 is India’s benchmark stock market index representing the top 50 companies listed on the National Stock Exchange.',

  '^BSESN':
    'SENSEX is the benchmark index of the Bombay Stock Exchange representing 30 financially sound companies across key sectors.',

  '^NSEBANK':
    'NIFTY Bank tracks the performance of major banking sector companies listed on the National Stock Exchange.'
};
const getStockDetails = async (symbol) => {

  let yahooSymbol =
    INDEX_MAP[symbol.toUpperCase()] || symbol;

  // Add .NS only for regular stocks
  if (
    !yahooSymbol.startsWith('^') &&
    !yahooSymbol.includes('.NS')
  ) {
    yahooSymbol = `${yahooSymbol}.NS`;
  }

  let quote;
  let summary;

  try {
    quote = await yahooFinance.quote(yahooSymbol);
    summary = await yahooFinance.quoteSummary(
      yahooSymbol,
      {
        modules: [
          'assetProfile',
          'financialData',
          'defaultKeyStatistics',
          'price',
          'summaryDetail',
          'incomeStatementHistory',
          'incomeStatementHistoryQuarterly',
          'majorHoldersBreakdown'
        ]
      }
    );
  } catch (err) {
    console.warn(`[stockDetailsService] Primary Yahoo fetch failed for ${yahooSymbol}, trying direct v8 chart API + FundamentalsSnapshot fallback: ${err.message}`);
    
    // 1. Fetch live price/change/volume from v8 chart endpoint
    let chartQuote = {};
    try {
        const axios = require('axios');
        const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`, {
            params: { range: '1d', interval: '1m' },
            timeout: 6000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        const result = response.data?.chart?.result?.[0];
        if (result && result.meta) {
            const meta = result.meta;
            const prices = result.indicators?.quote?.[0]?.close || [];
            const validPrices = prices.filter(p => p != null);
            const currentPrice = validPrices.length > 0 ? validPrices[validPrices.length - 1] : meta.regularMarketPrice;
            chartQuote = {
                symbol: yahooSymbol,
                longName: symbol,
                shortName: symbol,
                regularMarketPrice: currentPrice,
                regularMarketOpen: meta.regularMarketPrice || currentPrice,
                regularMarketDayHigh: meta.high || currentPrice,
                regularMarketDayLow: meta.low || currentPrice,
                regularMarketPreviousClose: meta.previousClose || currentPrice,
                regularMarketVolume: meta.regularMarketVolume || 0,
                marketCap: meta.marketCap || 0,
                fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || currentPrice,
                fiftyTwoWeekLow: meta.fiftyTwoWeekLow || currentPrice
            };
        }
    } catch (chartErr) {
        console.warn(`[stockDetailsService] Chart fallback also failed: ${chartErr.message}`);
    }

    // 2. Fetch fundamentals from database FundamentalsSnapshot
    let dbSnap = null;
    try {
        const FundamentalsSnapshot = require('../models/FundamentalsSnapshot');
        const cleanSym = String(symbol).toUpperCase().replace(/\.(NS|BO)$/i, '');
        dbSnap = await FundamentalsSnapshot.findOne({ symbol: cleanSym }).lean();
    } catch (dbErr) {
        console.warn(`[stockDetailsService] DB lookup failed: ${dbErr.message}`);
    }

    // 3. Fallback objects
    quote = {
        symbol: yahooSymbol,
        longName: symbol,
        shortName: symbol,
        regularMarketPrice: chartQuote.regularMarketPrice || 0,
        regularMarketOpen: chartQuote.regularMarketOpen || 0,
        regularMarketDayHigh: chartQuote.regularMarketDayHigh || 0,
        regularMarketDayLow: chartQuote.regularMarketDayLow || 0,
        regularMarketPreviousClose: chartQuote.regularMarketPreviousClose || 0,
        regularMarketVolume: chartQuote.regularMarketVolume || 0,
        marketCap: chartQuote.marketCap || dbSnap?.marketCap || 0,
        fiftyTwoWeekHigh: chartQuote.fiftyTwoWeekHigh || dbSnap?.fiftyTwoWeekHigh || 0,
        fiftyTwoWeekLow: chartQuote.fiftyTwoWeekLow || dbSnap?.fiftyTwoWeekLow || 0
    };

    summary = {
        assetProfile: {
            sector: dbSnap?.sector || '-',
            industry: dbSnap?.industry || '-',
            website: dbSnap?.website || '-',
            fullTimeEmployees: dbSnap?.fullTimeEmployees || null,
            longBusinessSummary: dbSnap?.longBusinessSummary || ABOUT_FALLBACKS[yahooSymbol] || `${symbol} is listed on the exchange.`,
            city: '',
            country: dbSnap?.country || '',
            companyOfficers: dbSnap?.ceo ? [{ name: dbSnap.ceo }] : []
        },
        financialData: {
            returnOnEquity: dbSnap?.roe ? dbSnap.roe / 100 : 0,
            debtToEquity: dbSnap?.debtToEquity ? dbSnap.debtToEquity * 100 : 0,
            revenueGrowth: dbSnap?.revenueGrowth ? dbSnap.revenueGrowth / 100 : 0
        },
        defaultKeyStatistics: {
            forwardPE: dbSnap?.forwardPe || dbSnap?.pe || 0,
            profitMargins: dbSnap?.profitMargins ? dbSnap.profitMargins / 100 : 0
        },
        incomeStatementHistory: {
            incomeStatementHistory: []
        },
        incomeStatementHistoryQuarterly: {
            incomeStatementHistory: []
        },
        majorHoldersBreakdown: {
            insidersPercentHeld: 0.5,
            institutionsPercentHeld: 0.3
        }
    };
  }
  console.log(summary.assetProfile);
  const quarterly = summary?.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
  const yearly = summary?.incomeStatementHistory?.incomeStatementHistory || [];

  const formatIncomeData = (history, isQuarterly) => {
    return history
      .slice(0, 5)
      .reverse()
      .map(item => {
        const date = new Date(item.endDate);
        let periodLabel = '';
        if (isQuarterly) {
            periodLabel = `Q${Math.floor(date.getMonth() / 3) + 1} '${date.getFullYear().toString().slice(-2)}`;
        } else {
            periodLabel = `'${date.getFullYear().toString().slice(-2)}`;
        }
        return {
          quarter: periodLabel,
          revenue: (item.totalRevenue || 0) / 10000000,
          profit: (item.netIncome || 0) / 10000000
        };
      });
  };

  const financialPerformance = {
    quarterly: formatIncomeData(quarterly, true),
    yearly: formatIncomeData(yearly, false)
  };

  const majorHolders = summary?.majorHoldersBreakdown || {};
  const promoters = (majorHolders.insidersPercentHeld || 0) * 100;
  const institutions = (majorHolders.institutionsPercentHeld || 0) * 100;
  const retail = Math.max(0, 100 - (promoters + institutions));

  const shareholding = {
    promoters: promoters.toFixed(2),
    institutions: institutions.toFixed(2),
    retail: retail.toFixed(2)
  };

  return {
    ...normalizeStockData(quote, summary),
    about:
      summary?.assetProfile?.longBusinessSummary ||
      ABOUT_FALLBACKS[yahooSymbol] ||
      '',
    financialPerformance,
    shareholding
  };
};

module.exports = {
  getStockDetails
};