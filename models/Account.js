const { Schema, model } = require('mongoose');

const schema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isMember: {
        type: Boolean,
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

module.exports = model('Account', schema);