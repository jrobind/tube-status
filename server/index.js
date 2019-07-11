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

// public Key:
const public = 'BMxCL9xQalPh6wuJ9Fek00RQksZ8rqHZMZVEbdTFFH1IuZWsQy9QJswUkLaNFMy5W6huGenM04c50qZns_GFKqo';
// private Key:
const private = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@test.com", public, private);

// temp database

const dataStore = {};

// Subscribe Route
app.post("/subscribe", (req, res) => {
    // pushSubscription object
    console.log('REACHING')
    const subscription = req.body;
    // payload
    (async() => {
        const results = await apiResults.fetchAllLineStatus(); 
         console.log(results);
        webpush
            .sendNotification(subscription, { results, title: 'TESTINg' })
            .catch(err => console.error(err));
        
      })();

});

app.listen(5000, () => console.log(`Server started on port 5000`));
