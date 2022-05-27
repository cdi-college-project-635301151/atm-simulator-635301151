const mongoose = require("mongoose");
const apiConfig = require("./apiConfig");
const Schema = mongoose.Schema;

const userAuthSchema = new Schema(
  {
    userCode: Number,
    userPin: Number,
    apiConfig: apiConfig,
    pinUpdate: {
      type: Boolean,
      default: true
    },
    userType: {
      type: String,
      default: "001"
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    isEnabled: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    attemps: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = userAuthSchema;
