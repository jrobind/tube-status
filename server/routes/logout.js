const express = require('express');
const passport = require('passport'); 
const db = require('../models');
const middleware = require('../middleware');
const router = express.Router();

// post route for user logout
router.post('/logout', passport.authenticate('jwt', { session: false }), middleware.jwtVerify, (req, res) => {
  const googleId = res.locals.decoded._json.sub;

  db.UserModel.updateOne({ googleId }, { $set: {signedIn: false } }, (err, resp) => {
    if (!err) {
      console.log('Successfully updated signed in status', resp);
      res.json({ message: 'You have logged out.' });
    }
  });
});

module.exports = router;