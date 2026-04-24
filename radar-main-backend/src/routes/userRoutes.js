const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getUserProfile, getMode, updateMode } = require('../controllers/userController');
=======
const { 
    getUserProfile, 
    getMode, 
    updateMode,
    getUserPortfolio,
    getUserPerformance,
    getUserHoldings,
    getUserInsights,
    getUserNews,
    getUserEvents
} = require('../controllers/userController');
const { getSettings, updateSettings } = require('../controllers/settingsController');
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, getUserProfile);
router.get('/mode', authMiddleware, getMode);
router.patch('/mode', authMiddleware, updateMode);
<<<<<<< HEAD
=======
router.get('/settings', authMiddleware, getSettings);
router.post('/settings', authMiddleware, updateSettings);

// Investor Dashboard APIs
router.get('/portfolio', authMiddleware, getUserPortfolio);
router.get('/performance', authMiddleware, getUserPerformance);
router.get('/holdings', authMiddleware, getUserHoldings);
router.get('/insights', authMiddleware, getUserInsights);
router.get('/news', authMiddleware, getUserNews);
router.get('/events', authMiddleware, getUserEvents);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627

module.exports = router;
