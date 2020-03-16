const path = require("path");

module.exports = {
  entry: "./client/src/scripts/index.js",
  output: {
    path: path.resolve(__dirname, "client/build"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  mode: "production",
};
