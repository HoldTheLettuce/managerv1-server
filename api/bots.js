const express = require('express');
const shortid = require('shortid');

const { check, validationResult } = require('express-validator');

const Router = express.Router();

var bots = [];

Router.get('/stats', (req, res) => {
    res.json({
        totalCount: bots.length
    });
});

Router.get('/', (req, res) => {
    res.json(bots);
});

Router.get('/:id', (req, res) => {
    for(let i = 0; i < bots.length; i++) {
        if(bots[i].id === req.params.id) {
            return res.json(bots[i]);
        }
    }

    res.status(404).json({ message: 'Bot not found.' });
});

Router.post('/', [
    check('script').isString()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let newBot = {
        id: shortid.generate(),
        script: req.body.script,
        message: '',
        lastPingAt: Date.now()
    };

    console.log('Bot', newBot.id, 'connected.');

    bots.push(newBot);

    res.json(newBot);
});

Router.put('/', [
    check('ids').isArray()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let updatedBots = [];

    req.body.ids.forEach(id => {
        for(let i = 0; i < bots.length; i++) {
            if(bots[i].id === id) {
                bots[i].lastPingAt = Date.now();

                if(req.body.message) {
                    bots[i].message = req.body.message;
                }

                updatedBots.push(bots[i]);
            }
        }
    });

    return res.json(updatedBots);
});

Router.put('/:id', [
    check('state').isString()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    for(let i = 0; i < bots.length; i++) {
        if(bots[i].id === req.params.id) {
            bots[i].state = req.body.state;
            bots[i].lastPingAt = Date.now();

            return res.json(bots[i]);
        }
    }

    res.status(404).json({ message: 'Bot not found.' });
});

Router.delete('/', (req, res) => {
    bots = [];

    console.log('Bots disconnected.');

    res.json({ message: 'Deleted bots.' });
});

Router.delete('/:id', (req, res) => {
    for(let i = 0; i < bots.length; i++) {
        if(bots[i].id === req.params.id) {
            let deletedBot = bots[i];

            bots.splice(i, 1);

            console.log('Bot', deletedBot.id, 'disconnected.');

            return res.json(deletedBot);
        }
    }

    res.status(404).json({ message: 'Bot not found.' });
});

setInterval(() => {
    for(let i = 0; i < bots.length; i++) {
        if(Date.now() - bots[i].lastPingAt >= process.env.PING_INTERVAL) {
            console.log('Bot', bots[i].id, 'disconnected.');

            bots.splice(i, 1);
        }
    }
}, process.env.PING_INTERVAL / 2);

module.exports = {
    Router,
    bots
};