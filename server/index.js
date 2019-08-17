const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const db = require('./models');
require('dotenv').config({path: '../.env'});

const app = express();

// set static path
app.use(express.static('../client'));
app.use(bodyParser.json());
db.mongoSetup();

app.use('/api/', subscribe);
app.use('/api/', line);

// vapid keys
const publicKey = 'BAyM-TL7OKAfqC9A9AkUnHqyzf3Cw3yEkFmvNCg56H6GjRMxUOyW-YK4_DJ_BdFRuSFB-lxJpqXjyxFVX_hdGe4';
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@test.com", publicKey, privateKey);

app.listen(4500, () => console.log(`Server started on port 4500`));
