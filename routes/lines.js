const express = require("express");
const apiResults = require("../utlis/api");
const {removeDuplicate} = require("../utlis/remove-duplicate");
const debug = require("debug")("app:lines");
const router = new express.Router();

// get Route for line data
router.get("/lines", (req, res) => {
  // send results
  (async () => {
    try {
      const results = await apiResults.fetchAllLineStatus().catch((e) => debug(`error fetching lines ${e}`));
      const formattedResults = removeDuplicate(results);
      res.json(formattedResults);
    } catch (e) {
      debug(`error fetching line data ${e}`);
      res.status(500).json({error: e});
    }
  })();
});

module.exports = router;
