const Payees = require("../models/payees");

const createPayee = (req, res) => {
  const { uid, customers } = req.body;
  const { customerName, accountNumber } = customers;
  // const payee = new Payees({
  //   uid: uid,
  //   customerName: customerName,
  //   accountNumber: accountNumber
  // });

  Payees.findOneAndUpdate(
    { uid: uid },
    {
      $push: {
        customers: [
          { accountNumber: accountNumber, customerName: customerName }
        ]
      }
    },
    { upsert: true, new: true }
  )
    .then(result => {
      if (result) {
        res.status(201).json(result.customers);
      } else {
        res.status(200).json(result);
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const getPayees = (req, res) => {
  Payees.findOne({ uid: req.query.uid }, { customers: 1 })
    .then(result => {
      console.log(result);
      const { customers } = result;
      console.log(customers);
      res.status(200).json(customers);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const patchPayee = (req, res) => {
  const { _id, accountName, accountNumber } = req.body;
  Payees.findByIdAndUpdate(
    _id,
    {
      accountName: accountName,
      accountNumber: accountNumber
    },
    { new: true }
  )
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

module.exports = { createPayee, getPayees, patchPayee };
