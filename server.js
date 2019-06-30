const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const accountsAPI = require('./api/accounts');
const proxiesAPI = require('./api/proxies');
const botsAPI = require('./api/bots');
const launchingAPI = require('./api/launching');
const statsAPI = require('./api/stats');

mongoose.connect('mongodb://localhost:27017/manager', { useNewUrlParser: true });

app.use(cors());
app.use(express.json());

app.use('/api/accounts', accountsAPI);
app.use('/api/proxies', proxiesAPI);
app.use('/api/bots', botsAPI.Router);
app.use('/api/launching', launchingAPI);
app.use('/api/stats', statsAPI);

app.listen('3001', () => {
    console.log('Started server on port', 3001);
});