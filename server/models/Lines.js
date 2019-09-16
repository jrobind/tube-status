const mongoose = require('mongoose');

// Lines schema
const LinesSchema = new mongoose.Schema({
    'bakerloo': {
        goodService: Boolean,
        description: String
    },
    'central': {
        goodService: Boolean,
        description: String
    },
    'circle': {
        goodService: Boolean,
        description: String
    }, 
    'district': {
        goodService: Boolean,
        description: String
    },
    'hammersmith-city': {
        goodService: Boolean,
        description: String
    },
    'jubilee': {
        goodService: Boolean,
        description: String
    },
    'metropolitan': {
        goodService: Boolean,
        description: String
    },
    'northern': {
        goodService: Boolean,
        description: String
    },
    'piccadilly': {
        goodService: Boolean,
        description: String
    },
    'victoria': {
        goodService: Boolean,
        description: String
    },
    'waterloo-city': {
        goodService: Boolean,
        description: String
    },
    'tfl-rail': {
        goodService: Boolean,
        description: String
    }, 
    'london-overground': {
        goodService: Boolean,
        description: String
    },
    dlr: {
        goodService: Boolean,
        description: String
    }
});

const Lines = mongoose.model('Lines', LinesSchema);

module.exports = Lines;