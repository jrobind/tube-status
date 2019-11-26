const mongoose = require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    avatar: String,
    lines: [String],
    pushSubscription: Object,
    signedIn: Boolean
});

const User = mongoose.model('User', UserSchema);

module.exports = User;