const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');
require('dotenv').config();

// User schema
const userSchema = new mongoose.Schema({
    profile: {
        name: String,
        required: true,
        email: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    lines: Array,
    required: true
});

//function to validate user 
function validateUser(user) {
    const schema = {
      name: Joi.string().min(3).max(50).required(),
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(3).max(255).required()
    };
  
    return Joi.validate(user, schema);
  }

// generate authToken 
UserSchema.methods.generateAuthToken = () => jwt.sign({ _id: this._id }, config.get(process.env.PRIVATE_JWT_KEY));

const User = mongoose.model('User', userSchema);

// validate user function
function validateUser(user) {
    const schema = {
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      password: Joi.string().required()
    };
  
    return Joi.validate(user, schema);
}

module.exports = User;
exports.validate = validateUser;