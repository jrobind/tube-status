const express = require("express");
const passport = require("passport");
const db = require("../models");
const middleware = require("../middleware");
const router = new express.Router();

// post route for user logout
router.post(
  "/logout",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;

    db.UserModel.updateOne(
      {googleId},
      {$set: {signedIn: false}}, (err, resp) => {
        if (err) {
          res.status(400).send({error: "Failed to log out."});
        } else {
          console.log("Successfully updated signed in status", resp);
          res.status(200).send({message: "You have logged out."});
        }
      },
    );
  },
);

module.exports = router;
