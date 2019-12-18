const mongoose = require("mongoose");

// Lines schema
const LinesSchema = new mongoose.Schema({
  "bakerloo": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "central": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "circle": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "district": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "hammersmith-city": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "jubilee": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "metropolitan": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "northern": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "piccadilly": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "victoria": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "waterloo-city": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "tfl-rail": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "london-overground": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
  "dlr": [{
    goodService: Boolean,
    description: String,
    reason: String,
  }],
});

const Lines = mongoose.model("Lines", LinesSchema);

module.exports = Lines;
