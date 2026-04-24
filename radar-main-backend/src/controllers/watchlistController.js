<<<<<<< HEAD
const User = require('../models/User');

const getWatchlist = async (req, res) => {
    try {
        const user = req.user; 
        res.json(user.watchlist);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
=======
const Watchlist = require('../models/Watchlist');

const getWatchlists = async (req, res) => {
    try {
        const watchlists = await Watchlist.find({ userId: req.user._id });
        res.json(watchlists);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch watchlists" });
    }
};

const createWatchlist = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    try {
        const watchlist = new Watchlist({
            userId: req.user._id,
            name,
            items: []
        });
        await watchlist.save();
        res.status(201).json(watchlist);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Watchlist with this name already exists" });
        }
        res.status(500).json({ error: "Failed to create watchlist" });
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    }
};

const addToWatchlist = async (req, res) => {
<<<<<<< HEAD
    const { symbol, assetType, name } = req.body;

    if (!symbol || !assetType) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const user = req.user;

        const exists = user.watchlist.find(item => item.symbol === symbol);
        if (exists) {
            return res.status(400).json({ error: "Asset already in watchlist" });
        }

        user.watchlist.push({ symbol, assetType, name });
        await user.save();

        res.json(user.watchlist);
    } catch (error) {
        console.error(error);
=======
    const { id } = req.params;
    const { symbol } = req.body;

    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    try {
        const watchlist = await Watchlist.findOne({ _id: id, userId: req.user._id });
        if (!watchlist) return res.status(404).json({ error: "Watchlist not found" });

        const exists = watchlist.items.some(item => item.symbol === symbol.toUpperCase());
        if (exists) return res.status(400).json({ error: "Stock already in watchlist" });

        watchlist.items.push({ symbol: symbol.toUpperCase() });
        await watchlist.save();
        res.json(watchlist);
    } catch (error) {
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
        res.status(500).json({ error: "Failed to add to watchlist" });
    }
};

const removeFromWatchlist = async (req, res) => {
<<<<<<< HEAD
    const { symbol } = req.params;

    try {
        const user = req.user;

        user.watchlist = user.watchlist.filter(item => item.symbol !== symbol);
        await user.save();

        res.json(user.watchlist);
=======
    const { id, symbol } = req.params;

    try {
        const watchlist = await Watchlist.findOne({ _id: id, userId: req.user._id });
        if (!watchlist) return res.status(404).json({ error: "Watchlist not found" });

        watchlist.items = watchlist.items.filter(item => item.symbol !== symbol.toUpperCase());
        await watchlist.save();
        res.json(watchlist);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
    } catch (error) {
        res.status(500).json({ error: "Failed to remove from watchlist" });
    }
};

<<<<<<< HEAD
module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
=======
module.exports = { getWatchlists, createWatchlist, addToWatchlist, removeFromWatchlist };
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
