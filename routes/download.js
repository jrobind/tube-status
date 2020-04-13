const express = require("express");
const passport = require("passport");
const middleware = require("../middleware");
const db = require("../models");
const debug = require("debug")("app:download");
const router = new express.Router();

// get Route for requesting user stored data for the user.
router.get(
  "/download",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    // find current user data and send .txt file
    db.UserModel.findOne({googleId}, (err, resp) => {
      if (err) {
        debug(`error retrieving user data for download request ${err}`);
        res.status(500).json({error: "error retrieving user data"});
      }

      if (resp) {
        const filteredSubIds = resp.subscriptions.map((sub) => {
          return {days: sub.days, hours: sub.hours, line: sub.line};
        });

        const response = {
          googleid: resp.googleId,
          avatar: resp.avatar,
          subscriptions: filteredSubIds,
          signedIn: resp.signedIn,
        };
        res.json(response);
      }
    });
  },
);

module.exports = router;
