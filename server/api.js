const fetch = require("node-fetch");
const AbortController = require("abort-controller");
require("dotenv").config({path: "../.env"});

const timeout = 30000;
const key = process.env.API_KEY;
const url = `https://api.tfl.gov.uk/Line/Mode/tube,overground,dlr,tflrail/Status?app_id=${key}`;
const controller = new AbortController();
const signal = controller.signal;

// 30 second timeout
const timeoutId = setTimeout(() => controller.abort(), timeout);

const fetchAllLineStatus = async () => {
  try {
    const result = await fetch(url, {signal});
    return await result.json();
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("Fetch for line data timed out");
    } else {
      throw new Error(`Failed to retrieve line data: ${e}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {fetchAllLineStatus};
