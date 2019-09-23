const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport'); 
const db = require('../models');

const router = express.Router();

// get user's line subscriptions
router.get('/subscribe', passport.authenticate('jwt', { session: false }), (req, res) => {
    jwt.verify(req.headers.authorization.split(' ')[1], 'secret', (err,  decoded) => {
        if (err) console.log('cannot verify jwt');
        const googleId = decoded._json.sub;
        // find current user line subscriptions and send to client
        db.UserModel.findOne({ googleId }, (err, resp) => {
            if (resp) {
                res.json({ lines: resp.lines });
            } else {
                console.log('not finding user')
            }
        });
    });
});

// make a new line subscription
router.post('/subscribe', passport.authenticate('jwt', { session: false }), (req, res) => {
    jwt.verify(req.headers.authorization.split(' ')[1], 'secret', (err,  decoded) => {
        if (err) console.log('cannot verify jwt');
        const googleId = decoded._json.sub;
        const lines = req.body.line || [];
        console.log(googleId, 'from post subscription route')

        db.UserModel.findOneAndUpdate(googleId, { $push: { lines } },
            (err, success) => {
                if (err) {
                    console.log('Failed to update');
                } else {
                    console.log('Successfully updated', success);
                    res.json({ lines });
                }
        });
    });
});

// remove line subscription
router.put('/subscribe', passport.authenticate('jwt', { session: false }), (req, res) => {

});

module.exports = router;