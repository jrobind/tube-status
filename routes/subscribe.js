const express = require("express");
const passport = require("passport");
const db = require("../models");
const middleware = require("../middleware");
const debug = require("debug")("app:subscribe");
const router = new express.Router();

// get user line subscriptions
router.get("/subscribe",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    // find current user line subscriptions and send to client
    db.UserModel.findOne({googleId}, (err, resp) => {
      if (err) debug(`error finding user line subscriptions ${err}`);
      if (resp) {
        res.json({subscriptions: resp.subscriptions});
      } else {
        debug("error updating user line subscription");
      }
    });
  },
);

// get user push subscription enpoint
router.post("/subscribe/endpoint",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    const {pushSubscription, subscriptions} = req.body;

    // find current user line subscriptions and send to client
    db.UserModel.findOne({googleId}, (err, resp) => {
      if (err) debug(`error finding user push subscription endpoint ${err}`);
      if (resp) {
        const value = resp.pushSubscription && !subscriptions ? resp.pushSubscription.endpoint : null;

        if (!value) {
          const params = {$set: {"pushSubscription": pushSubscription}};

          db.UserModel.findOneAndUpdate(
            {googleId}, params, {new: true}, (err, resp) => {
              if (err) debug(`Failed to update user push subscription ${err}`);
              if (resp) {
                debug("Successfully updated user push subscription", resp);
                res.json({differentDevice: false});
              }
            },
          );
        } else {
          const value = pushSubscription.endpoint !== resp.pushSubscription.endpoint ? true : false;

          res.json({differentDevice: value});
        }
      } else {
        debug("error finding user push subscription endpoint");
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
    const {window: {days, hours}} = req.body;
    const line = req.body.line || [];
    const params = {
      $push: {"subscriptions": {"days": days, "hours": hours, "line": line}}};

    // save new line subscription data and push
    // subscription object to user model
    db.UserModel.findOneAndUpdate(
      {googleId}, params, {new: true}, (err, resp) => {
        if (err) debug(`Failed to update user line subscription ${err}`);
        if (resp) {
          debug("Successfully updated user line subscription", resp);
          res.json({subscription: resp.subscriptions});
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
    const params = {$pull: {"subscriptions": {"line": line}}};

    db.UserModel.findOneAndUpdate(
      {googleId},
      params,
      {new: true},
      (err, resp) => {
        if (err) debug(`Failed to remove subscription data ${err}`);
        if (resp) {
          debug("Successfully removed line", resp);
          res.json({subscription: resp.subscriptions});
        }
      });
  },
);

module.exports = router;
