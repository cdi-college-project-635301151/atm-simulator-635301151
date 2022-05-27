const mongoose = require("mongoose");

const historySchemea = new mongoose.Schema({
  value: {
    type: Number,
    default: 20000
  },
  accountNumber: {
    type: Number,
    default: 1234567890
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

const atmSchema = new mongoose.Schema(
  {
    atmCode: String,
    atmName: String,
    balance: {
      type: Number,
      default: 0
    },
    history: [historySchemea],
    archive: [historySchemea],
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("teller", atmSchema);
