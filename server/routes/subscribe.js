const express = require("express");
const passport = require("passport");
const db = require("../models");
const middleware = require("../middleware");

const router = new express.Router();

// get user"s line subscriptions
router.get("/subscribe",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    // find current user line subscriptions and send to client
    db.UserModel.findOne({googleId}, (err, resp) => {
      if (resp) {
        res.json({lines: resp.lines});
      } else {
        console.log("not finding user");
      }
    });
  },
);

// create a new line subscription
router.post(
  "/subscribe",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    const lines = req.body.line || [];
    const pushSubscription = req.body.pushSubscription;
    // save new line subscription and push subscription object to user
    db.UserModel.findOneAndUpdate(
      {googleId},
      {$push: {lines}, $set: {pushSubscription}},
      (err, success) => {
        if (err) {
          console.log("Failed to update");
        } else {
          console.log("Successfully updated", success);
          res.json({lines});
        }
      },
    );
  },
);

// remove line subscription
router.delete(
  "/subscribe",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    const line = req.body.line;

    db.UserModel.findOneAndUpdate({googleId}, {$pullAll: {lines: [line]}},
      (err, success) => {
        if (err) {
          console.log("Failed to update");
        } else {
          console.log("Successfully removed line", success);
          res.json({lines: line});
        }
      },
    );
  },
);

module.exports = router;
