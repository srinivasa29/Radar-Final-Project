const asyncHandler = require('express-async-handler');
const ohlcService = require('../services/ohlcService');
const logger = require('../config/logger');


const getHistoricalData = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const {
        exchange = 'NSE',
        timeframe = '1d',
        startDate,
        endDate,
<<<<<<< HEAD
        limit = 365,
    } = req.query;

=======
        from,
        to,
        limit = 365,
    } = req.query;

    const actualStartDate = from || startDate;
    const actualEndDate = to || endDate;

>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    if (!symbol) {
        res.status(400);
        throw new Error('Symbol is required');
    }

    const result = await ohlcService.getOHLCData({
        symbol,
        exchange,
        timeframe,
<<<<<<< HEAD
        startDate,
        endDate,
=======
        startDate: actualStartDate,
        endDate: actualEndDate,
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
        limit: parseInt(limit),
    });

    if (!result.success) {
        res.status(500);
        throw new Error(result.message || 'Failed to fetch OHLC data');
    }

    res.json({
        success: true,
        symbol,
        exchange,
        timeframe,
        count: result.count,
        data: result.data,
    });
});


const getLatestCandle = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const { exchange = 'NSE', timeframe = '1d' } = req.query;

    if (!symbol) {
        res.status(400);
        throw new Error('Symbol is required');
    }

    const result = await ohlcService.getLatestOHLC(symbol, exchange, timeframe);

    if (!result.success) {
        res.status(500);
        throw new Error('Failed to fetch latest OHLC data');
    }

    if (!result.data) {
        res.status(404);
        throw new Error('No data found for this symbol');
    }

    res.json({
        success: true,
        symbol,
        exchange,
        timeframe,
        data: result.data,
    });
});


const getAvailableSymbols = asyncHandler(async (req, res) => {
    const { exchange } = req.query;
<<<<<<< HEAD

    const result = await ohlcService.getAvailableSymbols(exchange);

=======
    const result = await ohlcService.getAvailableSymbols(exchange);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    if (!result.success) {
        res.status(500);
        throw new Error('Failed to fetch available symbols');
    }
<<<<<<< HEAD

=======
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    res.json({
        success: true,
        count: result.count,
        exchange: exchange || 'all',
        symbols: result.symbols,
    });
});

<<<<<<< HEAD
=======
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

>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
module.exports = {
    getHistoricalData,
    getLatestCandle,
    getAvailableSymbols,
<<<<<<< HEAD
=======
    getCompareData
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
};
