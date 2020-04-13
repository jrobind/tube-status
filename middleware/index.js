const jwt = require("jsonwebtoken");
const debug = require("debug")("app:middleware");

const jwtVerify = (req, res, next) => {
  if (!req.headers.authorization) {
    debug("user not authorised");
    res.status(401).json({message: "user not authorised"});
    return;
  }

  jwt.verify(
    req.headers.authorization.split(" ")[1],
    process.env.JWT_SECRET,
    (err, decoded) => {
      if (err) {
        debug(`user not authorised ${err}`);
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

module.exports = {jwtVerify};
