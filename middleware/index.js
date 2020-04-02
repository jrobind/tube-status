const jwt = require("jsonwebtoken");
const globals = require("../utlis/global");

const jwtVerify = (req, res, next) => {
  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        // send 401 back to user and return
        res.status(401).json({err, message: "user not authorised"});
        return;
      } else {
        res.locals.decoded = decoded;
        next();
      }
    },
  );
};

const checkNotificationsFeature = (req, res, next) => {
  if (globals.notificationsFeature) {
    next();
  } else {
    res.redirect("/");
  }
};

module.exports = {jwtVerify, checkNotificationsFeature};
