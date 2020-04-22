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

    db.UserModel.findOne({googleId}, (err, resp) => {
      if (err) debug(`error finding user ${err}`);
      if (resp) {
        const requestPushEndpoint = pushSubscription.endpoint;
        const pushExists = resp.pushSubscription.some((push) => push.endpoint === requestPushEndpoint);
        console.log(pushExists);

        if (pushExists) {
          res.json({push: resp.pushSubscription});
        } else {
          resp.pushSubscription.push(pushSubscription);

          resp.save((err) => {
            if (err) {
              debug(`Failed to update user push subscription ${err}`);
            } else {
              debug("Successfully updated user push subscription");
              res.json({push: resp.pushSubscription});
            }
          });
        }
      } else {
        debug("error finding user push subscription");
      }
    });
  },
);

module.exports = router;
