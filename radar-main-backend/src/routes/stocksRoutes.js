const express = require('express');
const router = express.Router();
const {
    getFundamentals,
    getEarningsCalendar,
    getNewsSentiment,
<<<<<<< HEAD
} = require('../controllers/stockInsightsController');
=======
    getSignals,
} = require('../controllers/stockInsightsController');
const { getHistoricalData, getCompareData, getAvailableSymbols, getLatestCandle } = require('../controllers/ohlcController');

>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest, validateSymbolParam } = require('../middleware/validationMiddleware');

router.get('/:symbol/fundamentals', authMiddleware, validateSymbolParam, validateRequest, getFundamentals);
router.get('/:symbol/earnings-calendar', authMiddleware, validateSymbolParam, validateRequest, getEarningsCalendar);
router.get('/:symbol/news-sentiment', authMiddleware, validateSymbolParam, validateRequest, getNewsSentiment);
<<<<<<< HEAD
=======
router.get('/:symbol/signals', authMiddleware, validateSymbolParam, validateRequest, getSignals);
router.get('/:symbol/history', validateSymbolParam, validateRequest, getHistoricalData);
router.get('/:symbol/live', validateSymbolParam, validateRequest, getLatestCandle);
router.post('/compare', authMiddleware, getCompareData);
router.get('/search', authMiddleware, getAvailableSymbols);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627

module.exports = router;
