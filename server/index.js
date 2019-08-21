const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const session = require('express-session');
const passport = require('passport');  
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./models');
require('dotenv').config({path: '../.env'});

// require routes
const subscribe = require('./routes/subscribe');
const line = require('./routes/lines');

const app = express();

app.use('/api/', subscribe);
app.use('/api/', line);

// vapid keys
const publicKey = 'BAyM-TL7OKAfqC9A9AkUnHqyzf3Cw3yEkFmvNCg56H6GjRMxUOyW-YK4_DJ_BdFRuSFB-lxJpqXjyxFVX_hdGe4';
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@test.com", publicKey, privateKey);

// set static path
app.use(express.static('../client'));
app.use(bodyParser.json());
db.mongoSetup();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
})); 
app.use(passport.initialize());  
app.use(passport.session()); 

passport.serializeUser((user, done) => {  
    done(null, user);
});
  
passport.deserializeUser((userDataFromCookie, done) => {  
    done(null, userDataFromCookie);
});

const accessProtectionMiddleware = (req, res, next) => {  
    if (req.isAuthenticated()) {
        console.log('reaching! auth middleware')
      next();
    } else {
      console.log('NOT WORKING not authed')
      res.status(403).json({
        message: 'must be logged in to continue',
      });
    }
  };

// set up passport strategy
passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: 'http://localhost:4500/auth/google/callback',
      scope: ['email', 'profile'],
    },
    // verify function
    (accessToken, refreshToken, profile, cb) => {
      console.log('Our user authenticated with Google, and Google sent us back this profile, identifying the authenticated user:', profile);
      return cb(null, profile);
    },
  ));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', session: true }), (req, res) => {
    console.log('wooo we authenticated, here is our user object:', req.user);
    res.redirect('/')
  }
);
  
// A secret endpoint accessible only to logged-in users
app.get('/protected', accessProtectionMiddleware, (req, res) => {
    console.log('protected accessed')  
    res.json({
        message: 'You have accessed the protected endpoint!',
        yourUserInfo: req.user,
    });
});

// logout
app.get('/logout', (req, res) => {
    req.logout();
    console.log('logged out')
    res.json({message: 'logged out'});
});

app.listen(4500, () => console.log(`Server started on port 4500`));
