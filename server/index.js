const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const apiResults = require('./api');
require('dotenv').config({path: '../.env'});

const app = express();

// set static path
app.use(express.static('../client'));

app.use(bodyParser.json());

// vapid keys
const publicKey = 'BAyM-TL7OKAfqC9A9AkUnHqyzf3Cw3yEkFmvNCg56H6GjRMxUOyW-YK4_DJ_BdFRuSFB-lxJpqXjyxFVX_hdGe4';
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@test.com", publicKey, privateKey);

// temp database
const dataStore = {};

// Subscribe Route
app.post("/subscribe", (req, res) => {
    // pushSubscription object
    console.log('REACHING')
    const subscription = req.body;
    // payload
    // (async() => {
    //     const results = await apiResults.fetchAllLineStatus(); 
    //      console.log(results);
    const payload = JSON.stringify({title: "TESTING"})
    webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));
        
    //   })();

});

app.listen(4000, () => console.log(`Server started on port 4000`));
