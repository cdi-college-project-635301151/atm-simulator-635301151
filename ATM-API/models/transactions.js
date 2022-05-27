const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const historySchema = new Schema({
  description: String,
  value: {
    type: Number,
    default: 0
  },
  postedDate: {
    type: Date,
    default: () => Date.now()
  }
});

const transactionSchema = new Schema(
  {
    accountNumber: Number,
    history: [historySchema],
    archive: [historySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("transaction", transactionSchema);
