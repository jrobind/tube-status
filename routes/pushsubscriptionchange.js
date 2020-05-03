const express = require("express");
const db = require("../models");
const debug = require("debug")("app:pushsubscriptionchange");
const router = new express.Router();

// updates expired user push subscription
router.post("/pushsubscriptionchange", (req, res) => {
  const {newEndpoint, oldEndpoint} = req.body;
  const findParams = {
    "pushSubscription": {
      "$elemMatch": {
        "endpoint": oldEndpoint,
      },
    },
  };
  const updateParams = {$set: {"pushSubscription.$.endpoint": newEndpoint}};

  db.UserModel.findOneAndUpdate(
    findParams, updateParams, {new: true}, (err, resp) => {
      if (err) debug(`Failed to update user line subscription after expiration ${err}`);
      if (resp) {
        res.status(200);
        debug("Successfully updated user line subscription after expiration", resp);
      }
    },
  );
});

module.exports = router;
