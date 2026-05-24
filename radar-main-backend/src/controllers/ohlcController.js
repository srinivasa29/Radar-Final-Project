const asyncHandler = require('express-async-handler');
const ohlcService = require('../services/ohlcService');
const stockDetailsService = require('../services/stockDetailsService');

const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

const getHistoricalData = async (req, res) => {
    try {
        const { symbol } = req.params;
        const { interval = '1d' } = req.query;

        let result;
        try {
            result = await yahooFinance.chart(symbol, {
                period1: '2025-01-01',
                period2: new Date(),
                interval: interval
            });
        } catch (err) {
            console.warn(`[ohlcController] yahooFinance.chart failed for ${symbol}, trying direct v8 chart endpoint fallback: ${err.message}`);
            try {
                const axios = require('axios');
                const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
                    params: {
                        period1: Math.floor(new Date('2025-01-01').getTime() / 1000),
                        period2: Math.floor(new Date().getTime() / 1000),
                        interval: interval
                    },
                    timeout: 8000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json'
                    }
                });

                const chartResult = response.data?.chart?.result?.[0];
                if (!chartResult) {
                    throw new Error(`Direct v8 chart endpoint returned no data for ${symbol}`);
                }

                const timestamps = chartResult.timestamp || [];
                const quote = chartResult.indicators?.quote?.[0] || {};
                
                result = {
                    quotes: timestamps.map((ts, idx) => ({
                        date: new Date(ts * 1000),
                        open: quote.open?.[idx],
                        high: quote.high?.[idx],
                        low: quote.low?.[idx],
                        close: quote.close?.[idx],
                        volume: quote.volume?.[idx]
                    }))
                };
            } catch (fallbackErr) {
                throw new Error(`Yahoo Finance chart library and direct fallback both failed: ${fallbackErr.message}`);
            }
        }

        const candles =
            result?.quotes?.map(candle => ({
                datetime: candle.date,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.volume
            })) || [];

        return res.json({
            success: true,
            symbol,
            interval,
            count: candles.length,
            data: candles
        });

    } catch (error) {
        console.error('HISTORY ERROR:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const liveMarketService = require('../services/liveMarketService');

const getLatestCandle = asyncHandler(async (req, res) => {
    const { symbol } = req.params;

    if (!symbol) {
        res.status(400);
        throw new Error('Symbol is required');
    }

    const result = await liveMarketService.getLiveMarketData(symbol);

    if (!result.success) {
        res.status(500);
        throw new Error(result.message || 'Failed to fetch live market data');
    }

    res.json({
        success: true,
        data: result.data,
    });
});


const getAvailableSymbols = asyncHandler(async (req, res) => {
    const { exchange } = req.query;
    const result = await ohlcService.getAvailableSymbols(exchange);
    if (!result.success) {
        res.status(500);
        throw new Error('Failed to fetch available symbols');
    }

    res.json({
        success: true,
        count: result.count,
        exchange: exchange || 'all',
        symbols: result.symbols,
    });
});

const getCompareData = asyncHandler(async (req, res) => {
    const { symbols, from, to, timeframe = '1d' } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
        res.status(400);
        throw new Error('Symbols array is required');
    }

    const results = {};
    const promises = symbols.map(async (sym) => {
        const result = await ohlcService.getOHLCData({
            symbol: sym,
            startDate: from,
            endDate: to,
            timeframe
        });
        if (result.success) {
            results[sym] = result.data;
        }
    });

    await Promise.all(promises);
    res.json(results);
});

const getChartData = asyncHandler(async (req, res) => {

    const { symbol } = req.params;
    //const { timeframe = '1Y' } = req.query;
    //const { interval = '1d' } = req.query;
    const {
        interval = '1d',
        daysBack = 365,
        period1,
        period2
    } = req.query;

    if (!symbol) {
        res.status(400);
        throw new Error('Symbol is required');
    }

    const chartService = require('../services/chartService');

    /*let interval = '1d';

    // Convert frontend timeframe to Yahoo intervals
    if (timeframe === '1D') interval = '1d';
    else if (timeframe === '5D') interval = '1h';
    else if (timeframe === '1M') interval = '1h';
    else if (timeframe === '3M') interval = '1d';
    else if (timeframe === '6M') interval = '1d';
    else if (timeframe === '1Y') interval = '1d';
    else if (timeframe === '5Y') interval = '1wk';*/

    /*const data = await chartService.getChartData(
        symbol,
        interval
    );*/
    const data = await chartService.getChartData(
        symbol,
        interval,
        period1,
        period2,
        Number(daysBack)
    );

    res.json({
        success: true,
        symbol,
        interval,
        daysBack,
        data
    });

});
/*const getStockDetails = asyncHandler(async (req, res) => {

    const { symbol } = req.params;

    if (!symbol) {
        res.status(400);
        throw new Error('Symbol is required');
    }

    const data = await stockDetailsService.getStockDetails(symbol);

    res.json({
        success: true,
        data
    });
});*/
const getStockDetails = asyncHandler(async (req, res) => {

    try {

        const { symbol } = req.params;

        if (!symbol) {
            res.status(400);
            throw new Error('Symbol is required');
        }

        const data = await stockDetailsService.getStockDetails(symbol);

        res.json({
            success: true,
            data
        });

    } catch (error) {

        console.error('STOCK DETAILS ERROR:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
module.exports = {
    getHistoricalData,
    getLatestCandle,
    getAvailableSymbols,
    getCompareData,
    getChartData,
    getStockDetails
};
