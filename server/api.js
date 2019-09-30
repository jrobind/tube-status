const fetch = require("node-fetch");
require('dotenv').config({path: '../.env'});

const key = process.env.API_KEY;

const fetchAllLineStatus = async () => {
    const url = `https://api.tfl.gov.uk/Line/Mode/tube,overground,dlr,tflrail/Status?app_id=${key}`;

    try {
        const result = await fetch(url);
        return await result.json();
    } catch(e) {
        throw new Error(e);
    }
}

module.exports = { fetchAllLineStatus }