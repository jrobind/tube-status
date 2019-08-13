const mongoose = require('mongoose');
const UserModel = require('./User');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL);

// enable promises with mongoose
mongoose.Promise = Promise;
// export model once created
module.exports = { UserModel } 