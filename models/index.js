const mongoose = require("mongoose");
const UserModel = require("./User");
const LinesModel = require("./Lines");
const debug = require("debug")("app:database");
require("dotenv").config();

const mongoSetup = () => {
  mongoose.connect(process.env.DATABASE_URL, {useUnifiedTopology: true, useNewUrlParser: true});

  mongoose.connection
    .once("open", () => debug("Connection to tube-status DB made"))
    .on("error", (error) => debug(`Connection to tube-status DB failed: ${error}`));

  // enable promises with mongoose
  mongoose.Promise = Promise;
  mongoose.set("useFindAndModify", false);
};

// export model once created
module.exports = {UserModel, LinesModel, mongoSetup};
