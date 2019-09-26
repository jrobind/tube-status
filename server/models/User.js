const mongoose = require('mongoose');

// User schema
const UserSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    avatar: String,
    lines: [String],
    pushSubscription: Object
});

const User = mongoose.model('User', UserSchema);

module.exports = User;