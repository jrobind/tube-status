const express = require("express");
const apiResults = require("../utlis/api");
const router = new express.Router();

// get Route for line data
router.get("/lines", (req, res) => {
  // send results
  (async () => {
    try {
      const results = await apiResults.fetchAllLineStatus();
      res.json(results);
    } catch (e) {
      res.status(500).json({error: e});
    }
  })();
});

module.exports = router;
