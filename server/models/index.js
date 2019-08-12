const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL);

// enable promises with mongoose
mongoose.Promise = Promise;
// export model once created
module.exports = {} 