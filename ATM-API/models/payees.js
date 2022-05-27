const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customersSchema = new Schema({
  customerName: String,
  accountNumber: Number,
  createdAt: {
    type: Date,
    default: new Date().getDate()
  }
});

const payeeSchema = new Schema(
  {
    uid: String,
    customers: [customersSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("payee", payeeSchema);
