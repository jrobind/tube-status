const express = require("express");
const apiResults = require("../utlis/api");
const router = new express.Router();

// get Route for line data
router.get("/lines", (req, res) => {
  // send results
  (async () => {
    const results = await apiResults.fetchAllLineStatus();
    res.json(results);
  })();
});

module.exports = router;
