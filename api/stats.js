const express = require('express');
const os = require('os');

const Router = express.Router();

Router.get('/', (req, res) => {
    res.json({
        systemUptime: os.uptime(),
        platform: os.platform(),
        memory: {
            total: Math.trunc(os.totalmem()),
            free: Math.trunc(os.freemem())
        }
    });
});

module.exports = Router;