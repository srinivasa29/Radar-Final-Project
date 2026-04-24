<<<<<<< HEAD
const express = require('express');const router = express.Router();const { getNotifications, markRead } = require('../controllers/notificationController');const { authMiddleware } = require('../middleware/authMiddleware');router.get('/', authMiddleware, getNotifications);router.post('/read', authMiddleware, markRead);module.exports = router;
=======
const express = require('express');
const router = express.Router();
const { 
    getUserNotifications, 
    createNotification, 
    markAsRead, 
    markAllAsRead 
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/user', authMiddleware, getUserNotifications);
router.post('/create', authMiddleware, createNotification);
router.patch('/read/:id', authMiddleware, markAsRead);
router.patch('/read-all', authMiddleware, markAllAsRead);

module.exports = router;
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
