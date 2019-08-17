const mongoose = require('mongoose');
require('dotenv').config();

// User schema
const userSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    avatar: String,
    lines: Array
});

const User = mongoose.model('User', userSchema);

module.exports = User;