const express = require("express");
const db = require('./models');

const router = express.Router();

// subscribe Route
router.post('/subscribe', (req, res) => {
    console.log('REACHING SUBSCRIBE')
    const { pushSubscription, line } = req.body;
    dataStore.lines.push(line);

    const payload = JSON.stringify({title: "TESTING"})
    webpush
        .sendNotification(pushSubscription, payload)
        .catch(err => console.error(err));

});

module.exports = router;