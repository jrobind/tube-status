const express = require("express");
const passport = require("passport");
const middleware = require("../middleware");
const db = require("../models");
const router = new express.Router();

// delete route for removing user document.
router.delete(
  "/remove",
  passport.authenticate("jwt", {session: false}),
  middleware.jwtVerify,
  (req, res) => {
    const googleId = res.locals.decoded._json.sub;
    // find current user data and send .txt file
    db.UserModel.findOneAndRemove({googleId}, (err, resp) => {
      if (err) res.status(500).json({error: "error removing user document"});

      if (resp) res.sendStatus(200);
    });
  },
);

module.exports = router;
