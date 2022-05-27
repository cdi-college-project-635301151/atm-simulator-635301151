const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chequing = new Schema(
  {
    accountType: {
      type: String,
      default: "chequing"
    },
    accountNumber: {
      type: Number,
      minlength: 6,
      maxlength: 20
    },
    credit: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const savings = new Schema(
  {
    accountType: {
      type: String,
      default: "savings"
    },
    accountNumber: {
      type: Number,
      minlength: 6,
      maxlength: 20
    },
    credit: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const mortgage = new Schema(
  {
    accountType: {
      type: String,
      default: "mortgage"
    },
    accountNumber: {
      type: Number,
      minlength: 6,
      maxlength: 20
    },
    credit: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const lineOfCredit = new Schema({
  accountType: {
    type: String,
    default: "line of credit"
  },
  accountNumber: Number,
  maxCredit: {
    type: Number,
    default: 20000
  },
  credit: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const accountShema = new Schema(
  {
    userId: String,
    chequing: [chequing],
    savings: [savings],
    mortgage: [mortgage],
    lineOfCredit: [lineOfCredit]
  },
  { timestamps: true }
);

module.exports = mongoose.model("account", accountShema);
