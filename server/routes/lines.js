const express = require('express');
const apiResults = require('../api');
const router = express.Router();

// get Route for line data
router.get('/lines', (req, res) => {
    // send results
    (async() => {
        const results = await apiResults.fetchAllLineStatus(); 
         res.json(results);
      })();
});

module.exports = router;