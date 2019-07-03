const express = require('express');

const { check, validationResult } = require('express-validator');

const Account = require('../models/Account');

const Router = express.Router();

Router.get('/stats', (req, res) => {
    Account.find({}).then(accounts => {
        let totalCount = 0, notInUseCount = 0, inUseCount = 0;

        accounts.forEach(account => {
            totalCount++;
            
            if(account.inUse) {
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
    Account.find(req.query.inUse ? { inUse: req.query.inUse } : {}).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.get('/:id', (req, res) => {
    Account.findById(req.params.id).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.post('/', [
    check('username').isString(),
    check('password').isString(),
    check('isMember').isBoolean()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    Account.create({
        username: req.body.username,
        password: req.body.password,
        isMember: req.body.isMember
    }).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.put('/:id', (req, res) => {
    Account.findByIdAndUpdate(req.params.id, {
        ...req.body,
        lastPingAt: Date.now()
    }, { useFindAndModify: false }).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.delete('/', (req, res) => {
    Account.deleteMany({}).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

Router.delete('/:id', (req, res) => {
    Account.findByIdAndDelete(req.params.id).then(data => res.json(data)).catch(err => res.status(500).json({ message: err.message }));
});

setInterval(() => {
    Account.find({}).then(data => {
        data.forEach(account => {
            if(account.inUse && Date.now() - account.lastPingAt >= process.env.PING_INTERVAL) {
                account.inUse = false;
                account.save();
            }
        });
    });
}, process.env.PING_INTERVAL / 2);

module.exports = Router;