const express = require('express');
const os = require('os');
const { spawn } = require('child_process');
const { check, validationResult } = require('express-validator');

const Proxy = require('../models/Proxy');

const Router = express.Router();

Router.post('/', [
    check('amount').isNumeric(),
    check('stopIn').isNumeric(),
    check('world').isString(),
    check('useProxies').isBoolean()
], (req, res) => {
    let errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let { amount, stopIn, world, useProxies } = req.body;

    if(useProxies === true) {
        Proxy.find({ inUse: false }).limit(amount).then(data => {
            if(data.length === amount) {
                for(let i = 0; i < amount; i++) {
                    setTimeout(() => {
                        spawnBotProcess({
                            world,
                            proxy: data[i],
                            stopIn
                        });
                    }, i * process.env.LAUNCH_INTERVAL);
                }

                return res.json({
                    message: 'Launched bots.'
                });
            } else {
                return res.status(500).json({ message: 'Not enough proxies.' });
            }
        }).catch(err => {
            console.log(err);
    
            return res.status(500).json({ message: 'Failed to fetch proxies.' });
        });
    } else {
        for(let i = 0; i < amount; i++) {
            setTimeout(() => {
                spawnBotProcess({
                    world,
                    stopIn
                });
            }, i * process.env.LAUNCH_INTERVAL);
        }

        return res.json({
            message: 'Launched bots.'
        });
    }
});

spawnBotProcess = (launchObj) => {
    let args = [
        '-jar', `${ os.homedir() }/Desktop/QuantumLauncher.jar`,
        '-key', process.env.QB_API_KEY,
        '-nodraw',
        '-world', launchObj.world,
        '-script', 'Runner'
    ];

    if(launchObj.stopIn && launchObj.stopIn > 0) {
        args.push('-stop', launchObj.stopIn);
    }

    if(launchObj.proxy) {
        args.push('-proxy', launchObj.proxy.host, launchObj.proxy.port);
        args.push('-mproxy', launchObj.proxy._id);

        if(launchObj.proxy.auth) {
            args.push(launchObj.proxy.username, launchObj.proxy.password);
        }
    }

    console.log(args);

    let p = spawn('java', args, { detached: true, stdio: ['ignore'] });
    p.unref();
}

module.exports = Router;