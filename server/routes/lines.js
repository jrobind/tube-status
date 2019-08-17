const express = require("express");
const db = require('./models');

const router = express.Router();

// get Route for line data
router.get("/lines", (req, res) => {
    const line = req.line;
    dataStore.lines.push({ line });
    // send results
    (async() => {
        const results = await apiResults.fetchAllLineStatus(); 
         res.json(results);
      })();
});

modole.exports = router;