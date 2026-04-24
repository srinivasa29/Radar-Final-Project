const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
<<<<<<< HEAD
const { fetchStockHistory, fetchStockData } = require('./stockService');
const logger = require('../config/logger');

let traderInterval = null;
let investorInterval = null;
=======
const { fetchStockData } = require('./stockService');
const logger = require('../config/logger');

let alertInterval = null;
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
let alertEventEmitter = null;

const isDatabaseReady = () => mongoose.connection.readyState === 1;

<<<<<<< HEAD
const calculateRSI = (prices, period = 14) => {
    if (prices.length < period + 1) return null;
    let gains = 0;
    let losses = 0;
    for (let i = 1; i <= period; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    const recentPrices = prices.slice(-period - 1); 
    gains = 0;
    losses = 0;
    for (let i = 1; i < recentPrices.length; i++) {
        const diff = recentPrices[i] - recentPrices[i - 1];
        if (diff > 0) gains += diff;
        else losses -= diff;
    }
    avgGain = gains / period;
    avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};
const checkCondition = (value, condition, threshold) => {
    switch (condition) {
        case 'PRICE_ABOVE': return value > threshold;
        case 'PRICE_BELOW': return value < threshold;
        case 'RSI_ABOVE': return value > threshold;
        case 'RSI_BELOW': return value < threshold;
        case 'PE_BELOW': return value < threshold;
        case 'PE_ABOVE': return value > threshold;
        case 'EPS_GROWTH_ABOVE': return value > threshold;
        case 'MARKET_CAP_BELOW': return value < threshold; 
        default: return false;
    }
};

=======
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
const emitAlertTriggered = (payload) => {
    if (typeof alertEventEmitter === 'function') {
        alertEventEmitter('alert_triggered', {
            ...payload,
            timestamp: new Date().toISOString(),
        });
    }
};
<<<<<<< HEAD
const checkTraderAlerts = async () => {
    if (!isDatabaseReady()) {
        return;
    }

    try {
        const alerts = await Alert.find({ type: 'TRADER', status: 'ACTIVE' });
        if (alerts.length === 0) return;
        logger.info(`Checking ${alerts.length} Trader Alerts...`);
        const alertsBySymbol = {};
        alerts.forEach(alert => {
            if (!alertsBySymbol[alert.symbol]) alertsBySymbol[alert.symbol] = [];
            alertsBySymbol[alert.symbol].push(alert);
        });
        for (const symbol of Object.keys(alertsBySymbol)) {
            const history = await fetchStockHistory(symbol, '5min'); 
            if (!history || history.length < 15) continue;
            const prices = history.map(h => h.price);
            const latestPrice = prices[prices.length - 1]; 
            const rsi = calculateRSI(prices);
            for (const alert of alertsBySymbol[symbol]) {
                let triggered = false;
                let valueToCheck = 0;
                if (alert.condition.includes('PRICE')) {
                    valueToCheck = latestPrice;
                    triggered = checkCondition(latestPrice, alert.condition, alert.threshold);
                } else if (alert.condition.includes('RSI')) {
                    if (rsi === null) continue;
                    valueToCheck = rsi;
                    triggered = checkCondition(rsi, alert.condition, alert.threshold);
                }
                if (triggered) {
                    logger.info(`Alert Triggered: ${alert.symbol} ${alert.condition} ${alert.threshold}`);
                    await Notification.create({
                        user: alert.user,
                        type: 'PRICE_ALERT',
                        title: `Alert Triggered: ${alert.symbol}`,
                        message: `${alert.symbol} triggered ${alert.condition} (Value: ${valueToCheck.toFixed(2)})`,
                        metadata: { symbol: alert.symbol, value: valueToCheck.toString() }
                    });
                    alert.status = 'TRIGGERED';
                    await alert.save();
                    emitAlertTriggered({
                        alertId: String(alert._id),
                        userId: String(alert.user),
                        symbol: alert.symbol,
                        type: alert.type,
                        condition: alert.condition,
                        threshold: alert.threshold,
                        value: Number(valueToCheck || 0),
                        status: alert.status,
                    });
                }
            }
        }
    } catch (error) {
        logger.error(`Error in checkTraderAlerts: ${error.message}`);
    }
};
const checkInvestorAlerts = async () => {
    if (!isDatabaseReady()) {
        return;
    }

    try {
        const alerts = await Alert.find({ type: 'INVESTOR', status: 'ACTIVE' });
        if (alerts.length === 0) return;
        logger.info(`Checking ${alerts.length} Investor Alerts...`);
        const allStocks = await fetchStockData();
        const stockMap = new Map(allStocks.map(s => [s.symbol, s]));
        for (const alert of alerts) {
            const stock = stockMap.get(alert.symbol);
            if (!stock) continue;
            let triggered = false;
            let valueToCheck = 0;
            const details = stock.details || {};
            if (alert.condition.includes('PE')) {
                valueToCheck = details.pe_ratio;
                triggered = checkCondition(valueToCheck, alert.condition, alert.threshold);
            } else if (alert.condition.includes('EPS')) {
                valueToCheck = details.earnings_growth;
                triggered = checkCondition(valueToCheck, alert.condition, alert.threshold);
            } else if (alert.condition.includes('MARKET_CAP')) {
                let cap = details.market_cap || "0";
                let multiplier = 1;
                if (cap.includes('T')) multiplier = 1000;
                if (cap.includes('B')) multiplier = 1;
                valueToCheck = parseFloat(cap) * multiplier; 
                triggered = checkCondition(valueToCheck, alert.condition, alert.threshold); 
            }
            if (triggered) {
                logger.info(`Investor Alert Triggered: ${alert.symbol} ${alert.condition}`);
                await Notification.create({
                    user: alert.user,
                    type: 'PRICE_ALERT',
                    title: `Investment Alert: ${alert.symbol}`,
                    message: `${alert.symbol} matches ${alert.condition} strategy (Value: ${valueToCheck})`,
                    metadata: { symbol: alert.symbol, value: valueToCheck.toString() }
                });
                alert.status = 'TRIGGERED';
                await alert.save();
                emitAlertTriggered({
                    alertId: String(alert._id),
                    userId: String(alert.user),
                    symbol: alert.symbol,
                    type: alert.type,
                    condition: alert.condition,
                    threshold: alert.threshold,
                    value: Number(valueToCheck || 0),
                    status: alert.status,
=======

const checkAlerts = async () => {
    if (!isDatabaseReady()) return;

    try {
        const activeAlerts = await Alert.find({ isActive: true });
        if (activeAlerts.length === 0) return;

        logger.info(`Checking ${activeAlerts.length} active alerts...`);
        
        // Get unique symbols to fetch data efficiently
        const symbols = [...new Set(activeAlerts.map(a => a.symbol))];
        const stockData = await fetchStockData(symbols);
        const priceMap = new Map(stockData.map(s => [s.symbol, s.price]));

        for (const alert of activeAlerts) {
            const currentPrice = priceMap.get(alert.symbol);
            if (!currentPrice) continue;

            let triggered = false;
            if (alert.type === 'price') {
                // Simplified: trigger if price crosses the target
                // For a more robust system, we'd need to know if it's "Above" or "Below"
                // But following user's minimal schema, we'll assume targetPrice is the threshold
                // and we'll trigger if currentPrice >= targetPrice (Price Above logic as default)
                if (currentPrice >= alert.targetPrice) {
                    triggered = true;
                }
            } else if (alert.type === 'percentage') {
                // Percentage logic would need a base price, but user didn't provide one
                // We'll skip or use a default base for now
            }

            if (triggered) {
                logger.info(`Alert Triggered: ${alert.symbol} at ${currentPrice}`);
                
                // 1. Notification
                if (alert.delivery === 'app' || alert.delivery === 'both') {
                    await Notification.create({
                        userId: alert.userId,
                        type: 'PRICE_ALERT',
                        title: `Price Alert: ${alert.symbol}`,
                        message: `${alert.symbol} reached target price of ${alert.targetPrice} (Current: ${currentPrice})`,
                        metadata: { symbol: alert.symbol, targetPrice: alert.targetPrice, currentPrice }
                    });
                }

                // 2. Email (Simulated for architecture)
                if (alert.delivery === 'email' || alert.delivery === 'both') {
                    logger.info(`Sending email alert to user ${alert.userId} for ${alert.symbol}`);
                }

                // 3. Mark as inactive to avoid multiple triggers
                alert.isActive = false;
                await alert.save();

                // 4. Emit to Socket.io
                emitAlertTriggered({
                    alertId: alert._id,
                    userId: alert.userId,
                    symbol: alert.symbol,
                    currentPrice
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
                });
            }
        }
    } catch (error) {
<<<<<<< HEAD
        logger.error(`Error in checkInvestorAlerts: ${error.message}`);
    }
};
const startAlertEngine = () => {
    if (traderInterval || investorInterval) {
        return;
    }

    logger.info("Starting Alert Engine...");
    traderInterval = setInterval(checkTraderAlerts, 10000);
    investorInterval = setInterval(checkInvestorAlerts, 60000);
};

const stopAlertEngine = () => {
    if (traderInterval) {
        clearInterval(traderInterval);
        traderInterval = null;
    }

    if (investorInterval) {
        clearInterval(investorInterval);
        investorInterval = null;
    }

=======
        logger.error(`Error in Alert Engine: ${error.message}`);
    }
};

const startAlertEngine = () => {
    if (alertInterval) return;
    logger.info("Starting Advanced Alert Engine...");
    alertInterval = setInterval(checkAlerts, 30000); // Check every 30s
};

const stopAlertEngine = () => {
    if (alertInterval) {
        clearInterval(alertInterval);
        alertInterval = null;
    }
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    logger.info('Alert Engine stopped');
};

const setAlertEventEmitter = (emitter) => {
<<<<<<< HEAD
    alertEventEmitter = typeof emitter === 'function' ? emitter : null;
};

module.exports = { startAlertEngine, stopAlertEngine, checkTraderAlerts, checkInvestorAlerts, setAlertEventEmitter };
=======
    alertEventEmitter = emitter;
};

module.exports = { startAlertEngine, stopAlertEngine, setAlertEventEmitter };
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
