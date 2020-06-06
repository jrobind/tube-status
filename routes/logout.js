const express = require("express");
const passport = require("passport");
const db = require("../models");
const middleware = require("../middleware");
const debug = require("debug")("app:logout");
const router = new express.Router();

// post route for user logout
router.post(
  "/logout",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    const params = {$set: {"signedIn": false}};
    const io = req.app.get("io");

    db.UserModel.findOneAndUpdate(
      {googleId}, params, {new: true}, (err, resp) => {
        if (err) {
          debug(`failed to log out ${err}`);
          res.status(400).send({error: "Failed to log out."});
        }

        if (resp) {
          debug("Successfully updated signed in status");
          res.status(200).send({message: "You have logged out."});
          io.emit("io-logout-action", {id: resp.googleId});
        }
      });
  },
);

module.exports = router;
