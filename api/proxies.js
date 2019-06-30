const express = require('express');

const { check, validationResult } = require('express-validator');

const Proxy = require('../models/Proxy');

const Router = express.Router();

Router.get('/stats', (req, res) => {
    Proxy.find({}).then(proxies => {
        let totalCount = 0, notInUseCount = 0, inUseCount = 0;

        proxies.forEach(proxy => {
            totalCount++;
            
            if(proxy.inUse) {
                inUseCount++;
            } else {
                notInUseCount++;
            }
        });

        res.json({
            totalCount,
            notInUseCount,
            inUseCount
        });
    });
});

Router.get('/', (req, res) => {
    Proxy.find(req.query.inuse ? { inUse: req.query.inuse } : {}).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.get('/:id', (req, res) => {
    Proxy.findById(req.params.id).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.post('/', [
    check('host').isString(),
    check('port').isNumeric(),
    check('username').isString(),
    check('password').isString(),
    check('auth').isBoolean()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    Proxy.create({
        host: req.body.host,
        port: req.body.port,
        username: req.body.username,
        password: req.body.password,
        auth: req.body.auth
    }).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.put('/:id', (req, res) => {
    Proxy.findByIdAndUpdate(req.params.id, {
        ...req.body,
        lastPingAt: Date.now()
    }, { useFindAndModify: false }).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.delete('/', (req, res) => {
    Proxy.deleteMany({}).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.delete('/:id', (req, res) => {
    Proxy.findByIdAndDelete(req.params.id).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

setInterval(() => {
    Proxy.find({}).then(data => {
        data.forEach(proxy => {
            if(proxy.inUse && Date.now() - proxy.lastPingAt >= process.env.PING_INTERVAL) {
                proxy.inUse = false;
                proxy.save();
            }
        });
    });
}, process.env.PING_INTERVAL / 2);

module.exports = Router;