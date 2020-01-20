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
        res.json({subscriptions: resp.subscriptions});
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
    const {pushSubscription, window: {days, hours}} = req.body;
    const line = req.body.line || [];
    const params = {
      $push: {"subscriptions": {"days": days, "hours": hours, "line": line}},
      $set: {"pushSubscription": pushSubscription},
    };

    // save new line subscription data and push
    // subscription object to user model
    db.UserModel.findOneAndUpdate(
      {googleId}, params, (err, success) => {
        if (err) {
          console.log("Failed to update");
        } else {
          console.log("Successfully updated!!!", success);
          res.json({line});
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
    const params = {
      $set: {"subscriptions": [], "pushSubscription": pushSubscription},
    };

    db.UserModel.findOneAndUpdate({googleId}, params, (err, success) => {
      if (err) {
        console.log("Failed to remove subscription data");
      } else {
        console.log("Successfully removed line", success);
        res.json({lines: line});
      }
    });
  },
);

module.exports = router;
