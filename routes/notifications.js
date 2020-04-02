const express = require("express");
const globals = require("../utlis/global");
const router = new express.Router();

// post route for the notifications feature flag
router.post("/notifications", (req, res) => {
  globals.notificationsFeature = req.body.notificationsFeature;
  res.json("success");
});

module.exports = router;
