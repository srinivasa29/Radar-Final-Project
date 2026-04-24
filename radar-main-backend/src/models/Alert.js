<<<<<<< HEAD
const mongoose = require('mongoose');const AlertSchema = new mongoose.Schema({    user: {        type: mongoose.Schema.Types.ObjectId,        ref: 'User',        required: true    },    symbol: {        type: String,        required: true,        uppercase: true,        trim: true    },    type: {        type: String,        enum: ['TRADER', 'INVESTOR'],        required: true    },    condition: {        type: String,        required: true,        enum: [            'PRICE_ABOVE', 'PRICE_BELOW',            'RSI_ABOVE', 'RSI_BELOW',            'MACD_CROSSOVER',            'VOLUME_SPIKE',            'PE_BELOW', 'PE_ABOVE',            'EPS_GROWTH_ABOVE',            'MARKET_CAP_BELOW'        ]    },    threshold: {        type: Number,        required: true    },    status: {        type: String,        enum: ['ACTIVE', 'TRIGGERED', 'EXPIRED'],        default: 'ACTIVE'    },    expiresAt: {        type: Date,        required: true    }}, {    timestamps: true});AlertSchema.index({ status: 1, type: 1, expiresAt: 1 });AlertSchema.index({ user: 1, status: 1 });module.exports = mongoose.model('Alert', AlertSchema);
=======
const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    targetPrice: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['price', 'percentage'],
        default: 'price'
    },
    delivery: {
        type: String,
        enum: ['app', 'email', 'both'],
        default: 'app'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

AlertSchema.index({ userId: 1, symbol: 1 });
AlertSchema.index({ isActive: 1 });

module.exports = mongoose.model('Alert', AlertSchema);
>>>>>>> d95aecbc30ebb22d746689c5bb35c7617c0c1627
