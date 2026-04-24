const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const { getWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validateRequest, validateSymbolBody, validateSymbolParam, validateAssetTypeBody } = require('../middleware/validationMiddleware');

router.get('/', authMiddleware, getWatchlist);

router.post(
    '/',
    authMiddleware,
    validateSymbolBody,
    validateAssetTypeBody,
    validateRequest,
    addToWatchlist
);

router.delete('/:symbol', authMiddleware, validateSymbolParam, validateRequest, removeFromWatchlist);

router.get('/:persona', authMiddleware, getWatchlist);

router.post(
    '/:persona',
    authMiddleware,
    validateSymbolBody,
    validateAssetTypeBody,
    validateRequest,
    addToWatchlist
);

router.delete('/:persona/:symbol', authMiddleware, validateSymbolParam, validateRequest, removeFromWatchlist);
=======
const { getWatchlists, createWatchlist, addToWatchlist, removeFromWatchlist } = require('../controllers/watchlistController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.post('/:id/add', addToWatchlist);
router.delete('/:id/remove/:symbol', removeFromWatchlist);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627

module.exports = router;
