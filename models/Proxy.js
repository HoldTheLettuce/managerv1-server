const { Schema, model } = require('mongoose');

const schema = new Schema({
    host: {
        type: String,
        required: true
    },
    port: {
        type: Number,
        required: true
    },
    auth: {
        type: Boolean,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    inUse: {
        type: Boolean,
        default: false
    },
    lastPingAt: {
        type: Number,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = model('Proxy', schema);