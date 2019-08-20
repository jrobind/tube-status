const mongoose = require('mongoose');
const UserModel = require('./User');
require('dotenv').config();

const mongoSetup = () => {
    mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });

    mongoose.connection
    .once('open', () => console.log(`Connection to tube-status DB made`))
    .on('error', (error) => console.error(`Connection to tube-status DB failed: ${error}`));

    // enable promises with mongoose
    mongoose.Promise = Promise;
    mongoose.set('useFindAndModify', false);
}

// export model once created
module.exports = { UserModel, mongoSetup } 