const mongoose = require("mongoose");

// User schema
const UserSchema = new mongoose.Schema({
  googleId: String,
  avatar: String,
  subscriptions: [{
    line: String,
    days: [String],
    hours: [Number],
  }],
  pushSubscription: Object,
  signedIn: Boolean,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
