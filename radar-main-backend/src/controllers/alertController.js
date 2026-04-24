<<<<<<< HEAD
const asyncHandler = require('express-async-handler');const Alert = require('../models/Alert');const createAlert = asyncHandler(async (req, res) => {    const { symbol, type, condition, threshold, expiresAt } = req.body;    if (!symbol || !type || !condition || !threshold) {        res.status(400);        throw new Error('Please provide all required fields');    }    const alert = await Alert.create({        user: req.user._id,        symbol,        type,        condition,        threshold,        expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000)     });    res.status(201).json(alert);});const getAlerts = asyncHandler(async (req, res) => {    const alerts = await Alert.find({ user: req.user._id }).sort('-createdAt');    res.json(alerts);});const deleteAlert = asyncHandler(async (req, res) => {    const alert = await Alert.findById(req.params.id);    if (!alert) {        res.status(404);        throw new Error('Alert not found');    }    if (alert.user.toString() !== req.user._id.toString()) {        res.status(401);        throw new Error('User not authorized');    }    await alert.deleteOne();    res.json({ id: req.params.id });});module.exports = { createAlert, getAlerts, deleteAlert };
=======
const asyncHandler = require('express-async-handler');
const Alert = require('../models/Alert');

const createAlert = asyncHandler(async (req, res) => {
    const { symbol, targetPrice, type, delivery } = req.body;
    
    if (!symbol || !targetPrice) {
        res.status(400);
        throw new Error('Symbol and target price are required');
    }

    const alert = await Alert.create({
        userId: req.user._id,
        symbol: symbol.toUpperCase(),
        targetPrice,
        type: type || 'price',
        delivery: delivery || 'app',
        isActive: true
    });

    res.status(201).json(alert);
});

const getAlerts = asyncHandler(async (req, res) => {
    const { symbol } = req.query;
    const filter = { userId: req.user._id };
    if (symbol) filter.symbol = symbol.toUpperCase();

    const alerts = await Alert.find(filter).sort('-createdAt');
    res.json(alerts);
});

const deleteAlert = asyncHandler(async (req, res) => {
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!alert) {
        res.status(404);
        throw new Error('Alert not found');
    }

    await alert.deleteOne();
    res.json({ id: req.params.id, message: "Alert deleted" });
});

module.exports = { createAlert, getAlerts, deleteAlert };
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
