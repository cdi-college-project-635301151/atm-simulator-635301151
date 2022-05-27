const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const apiConfigScheman = new Schema(
  {
    apiKey: String,
    expiredAt: Date
  },
  { timestamps: true }
);

module.exports = apiConfigScheman;
