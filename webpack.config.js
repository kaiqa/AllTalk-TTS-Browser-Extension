const path = require("path"); // Import the 'path' module

module.exports = {
  entry: {
    background: "./background.js",
    content: "./content.js", // Add additional entry points here if needed
    // Add other scripts like popup.js if needed
  },
  output: {
    filename: "[name].bundle.js", // This will output background.bundle.js, content.bundle.js, etc.
    path: path.resolve(__dirname, "dist"), // Use 'path' module to resolve the output directory
  },
  mode: "production", // Use 'development' for easier debugging during development
  devtool: "source-map", // Include source maps for easier debugging
};
