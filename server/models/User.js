const mongoose = require('mongoose');
require('dotenv').config();

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    lines: Array,
    avatar: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;