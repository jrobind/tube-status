const express = require("express");
const passport = require("passport");
const db = require("../models");
const middleware = require("../middleware");
const debug = require("debug")("app:logout");
const router = new express.Router();

// get route for push subscription
router.get("/push",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;

    db.UserModel.findOne({googleId}, (err, resp) => {
      if (err) debug(`error finding user ${err}`);
      if (resp) {
        debug("Successfully found user", resp);
        res.json({push: resp.pushSubscription});
      } else {
        debug("error finding user push subscription");
      }
    });
  },
);

// post route for push subscription endpoint
router.post("/push",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    const {pushSubscription} = req.body;
    const params = {$set: {"pushSubscription": pushSubscription}};

    // find current user line subscriptions and send to client
    db.UserModel.findOneAndUpdate(
      {googleId}, params, {new: true}, (err, resp) => {
        if (err) debug(`Failed to update user push subscription ${err}`);
        if (resp) {
          debug("Successfully updated user push subscription", resp);
          res.json({push: resp.pushSubscription.endpoint});
        }
      },
    );
  },
);

module.exports = router;
