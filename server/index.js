const express = require("express");
const path = require('path');
const webpush = require("web-push");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const passport = require('passport');  
const jwt = require('jsonwebtoken');
const ExtractJWT = require('passport-jwt').ExtractJwt;
const JWTStrategy = require('passport-jwt').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./models'); 
const buildLine = require('./utlis/build-line');
require('dotenv').config({path: '../.env'});

// require routes
const subscribe = require('./routes/subscribe');
const line = require('./routes/lines');

const app = express();

app.use(express.static(path.join(__dirname, '../client')));
app.use(bodyParser.json());
db.mongoSetup();
app.use(passport.initialize()); 
app.use('/api/', subscribe);
app.use('/api/', line);

// vapid keys
const publicKey = 'BKpELtYde7iajTdW7hw1LOIksmgzApC5IMLUtwDkqDA_fdqWmdQ3FqU2azo0LH0G-2cIqq11gRrxCLtFj-pPSmE';
const privateKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@test.com", publicKey, privateKey); 

// setup initial line db data
buildLine();

// jwt middleware setup for protected routes 
passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
    },
    (jwtPayload, cb) => {
        return cb(null, jwtPayload);
    }
));

// set up passport strategy
passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/callback',
      scope: ['email', 'profile']
    },
    // verify function
    (accessToken, refreshToken, profile, cb) => {
      console.log('Our user authenticated with Google, and Google sent us back this profile, identifying the authenticated user:', profile);
      return cb(null, profile);
    },
  ));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/', session: false, prompt: 'select_account' }),
    async (req, res) => {
        console.log('wooo we authenticated, here is our user object:', req.user);
        const googleId = req.user.id;
        const profileData = { 
            googleId, // store user in db using unique Google id
            name: req.user.displayName,
            email: req.user.emails[0].value,
            avatar: req.user.photos[0].value,
        };
        // check if user exists. If not, then add to db.
        await db.UserModel.findOne({ googleId }, (err, resp) => {
            let lines;
            if (!resp) {
                const newUser = new db.UserModel(profileData);
                newUser.save()
                    .then((newUser) => {
                        console.log('User added to db', newUser);
                        // add user line data to req.user so we can sign token send back to client
                        lines = newUser.lines;
                    });
            } else {
                lines = resp.lines;
            }
            // add user line data to req.user so we can sign token send back to client
            req.user.lines = lines;
    });

    const htmlWithEmbeddedJWT = `
    <html>
        <script>
            // Save JWT to localStorage
            window.localStorage.setItem('JWT', '${jwt.sign(req.user, process.env.JWT_SECRET)}');
            // Redirect browser to root of application
            window.location.href = '/';
        </script>
        </html>
    `;

    res.send(htmlWithEmbeddedJWT);
  }
);
  
// A secret endpoint accessible only to logged-in users
app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    console.log('protected accessed')  
    res.json({
        message: 'You have accessed the protected endpoint!',
        yourUserInfo: req.user,
    });
});

// run line status check every two minutes and send push notification to relevant line subscribers   
setInterval(async () => {
    const response = await fetch('http://localhost:4000/api/lines').catch(e => console.log(e));
    const result = await response.json();
    let lineDbData;
    // check if there is a status diff, query users with related line subscription and send notification
    await db.LinesModel.find({}, (err, resp) => lineDbData = resp);

    result.forEach(line => {
        const { statusSeverityDescription, reason } = line.lineStatuses[0];
        const id = line.id;
        const diffExists = lineDbData[0][id].description !== statusSeverityDescription;

        if (true) {
            // query users and send notification
            // update line data to reflect new status
            db.UserModel.find({ 'lines': { $in: id } }, (err, resp) => {
                if (resp.length) {
                    const { pushSubscription } = resp[0]; 
                    const payload = JSON.stringify({
                        line: id,
                        status: reason ? reason : statusSeverityDescription // if delays, send the reason. Otherwise send default description
                     });
                    // send push notification
                    webpush
                        .sendNotification(pushSubscription, payload)
                        .then(res => console.log(res))
                        .catch(err => console.error(err));
                }
            });
        }
    });
    // update db with new line data
    buildLine();
}, 120000);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './client/index.html'));
});

app.listen(4000, () => console.log(`Server started on port 4000`));
