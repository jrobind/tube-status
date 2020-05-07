const express = require("express");
const path = require("path");
const webpush = require("web-push");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const compression = require("compression");
const ExtractJWT = require("passport-jwt").ExtractJwt;
const JWTStrategy = require("passport-jwt").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const CronJob = require("cron").CronJob;
const db = require("./models");
const buildLine = require("./utlis/build-line");
const {matchesDay, matchesTime} = require("./utlis/date-checker");
const debug = require("debug")("app:server");
const helmet = require("helmet");
require("dotenv").config({path: "./env"});

const app = express();
const server = app.listen(
  4000, () => debug("Server started on port 4000"));
const io = require("socket.io").listen(server, {pingTimeout: 60000});

// require routes
const subscribe = require("./routes/subscribe");
const line = require("./routes/lines");
const logout = require("./routes/logout");
const download = require("./routes/download");
const remove = require("./routes/remove");
const push = require("./routes/push");
const pushsubscriptionchange = require("./routes/pushsubscriptionchange");

app.set("io", io);
app.use(compression());
app.use(helmet());
app.use(express.static(path.join(__dirname, "/client"), {index: false}));
app.use(bodyParser.json());
db.mongoSetup();
app.use(passport.initialize());
// routes
app.use("/api/", subscribe);
app.use("/api/", line);
app.use("/api/", logout);
app.use("/api/", download);
app.use("/api/", remove);
app.use("/api/", push);
app.use("/api/", pushsubscriptionchange);

// vapid keys
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@test.com", PUBLIC_KEY, PRIVATE_KEY);

// setup initial line db data
buildLine();

// jwt middleware setup for protected routes
passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
},
(jwtPayload, cb) => {
  return cb(null, jwtPayload);
}));

// set up passport strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ["profile"],
},
// verify function
(accessToken, refreshToken, profile, cb) => {
  return cb(null, profile);
}));

app.get(
  "/auth/google/callback/",
  passport.authenticate(
    "google",
    {failureRedirect: "/", session: false, prompt: "select_account consent"},
  ),
  (err, req, res, next) => {
    if (err) {
      res.redirect("/pwa-installed");
    } else {
      next();
    }
  },
  async (req, res) => {
    const googleId = req.user.id;
    const profileData = {
      googleId, // store user in db using unique Google id
      avatar: req.user.photos[0].value,
      signedIn: true,
    };

    // check if user exists. If not, then add to db.
    await db.UserModel.findOne({googleId}, (err, resp) => {
      let subscriptions;

      if (err) debug(`error finding user in db ${err}`);
      if (!resp) {
        const newUser = new db.UserModel(profileData);
        newUser.save()
          .then((newUser) => {
            debug("User added to db", newUser);
            subscriptions = newUser.subscriptions;
          });
      } else {
        db.UserModel.updateOne(
          {googleId},
          {$set: {signedIn: true}},
          (err, resp) => {
            if (err) debug(`error signing in user ${err}`);
            if (resp) debug(`updated signed in status ${resp}`);
          },
        );
      }
      // add user line subscription data to req.user,
      // so we can sign token and send back to client
      req.user.subscriptions = subscriptions;
    });

    const htmlWithEmbeddedJWT = `
    <html>
      <script>
        // save JWT to localStorage
        window.localStorage.setItem(
          "JWT", "${jwt.sign(req.user, process.env.JWT_SECRET)}");
        // redirect browser to root of application
        window.location.href = "/";
      </script>
    </html>
    `;
    res.send(htmlWithEmbeddedJWT);
  },
);

// run line status check every minute,
// and send push notification to relevant line subscribers
const job = new CronJob("0 */1 * * * *", async () => {
  const response = await fetch("http://localhost:4000/api/lines").catch((e) => debug(`error fetching lines ${e}`));
  const result = await response.json();
  let lineDbData;
  let diffExists;

  // retrieve current stored lines from db
  await db.LinesModel.find({}, (err, resp) => {
    if (err) debug(`error retrieving current stored lines ${err}`);
    lineDbData = resp;
  });

  result.forEach((line) => {
    line.lineStatuses.forEach((status, i) => {
      const {statusSeverityDescription, reason} = status;

      // check the current line severity description (from api call)
      // against the stored db entry
      if (lineDbData) {
        const dbLine = lineDbData[0][line.id];

        if (statusSeverityDescription === "Good Service") {
          if (!dbLine[i]) {
            diffExists = true;
          } else {
            diffExists = dbLine[i].goodService ? false : true;
          }
        } else {
          diffExists = !dbLine[i] ? true : dbLine[i].reason !== reason;
        }
      }

      if (diffExists) {
        const params = {
          "subscriptions.line": {$in: line.id},
          "signedIn": {$in: true},
        };

        db.UserModel.find(params, (err, resp) => {
          if (err) debug(`error finding subscribed line ${err}`);
          if (resp.length) {
            resp.forEach((user) => {
              const {days, hours} = user.subscriptions.filter((sub) =>{
                return sub.line === line.id;
              })[0];

              // check subscription window before sending notification
              if (matchesDay(days) && matchesTime(hours)) {
                const {pushSubscription} = user;
                const payload = JSON.stringify({
                  line: line.id,
                  status: reason ? reason : statusSeverityDescription,
                });

                pushSubscription.forEach(async (subscription) => {
                  // send push notification
                  await webpush
                    .sendNotification(subscription, payload)
                    .catch((err) => debug(`error sending push notification ${err}`));
                });
              }
            });
          }
        });
      }
    });
  });
  // update line data to reflect new status
  buildLine();
});

job.start();

app.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/index.html"));
});

app.get("/pwa-installed", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/index.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/index.html"));
});
