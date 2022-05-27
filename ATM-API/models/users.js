const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userAuthSchema = require("./userAuth");

const addressSchema = new Schema(
  {
    streetAddress: {
      type: String,
      required: true
    },
    addressDesc: String,
    city: String,
    province: String,
    postal: String
  },
  { timestamps: true }
);

const userSchema = new Schema(
  {
    userAuth: userAuthSchema,
    firstName: String,
    lastName: String,
    phoneNumber: {
      type: String,
      required: true
    },
    address: addressSchema,
    email: {
      type: String,
      lowerCase: true,
      required: true
    },
    accountStatus: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
