const Transactions = require("../models/transactions");

const postAccountTransactions = (req, res) => {
  const { accountNumber, history } = req.body;
  Transactions.findOneAndUpdate(
    { accountNumber: accountNumber },
    {
      $push: { history: history }
    },
    { new: true, upsert: true }
  )
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
};

const getAccountTransactions = (req, res) => {
  console.log(req.query.account_number);

  Transactions.findOne({
    accountNumber: req.query.account_number
  })
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });

  // Transactions.findOne(
  //   {
  //     accountNumber: req.query.account_number
  //   },
  //   { _id: 1, history: 1 }
  // )
  //   .sort({ "history.postedDate": "desc" })
  //   .then(resp => {
  //     console.log(resp);

  //     res.status(200).json(resp);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     res.status(500).json(err);
  //   });
};

module.exports = {
  postAccountTransactions,
  getAccountTransactions
};
