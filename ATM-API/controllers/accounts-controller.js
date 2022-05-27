const Accounts = require("../models/accounts");

const createAccount = (req, res) => {
  const { uid } = req.body;
  let $data = {};

  if (req.body.chequing) {
    $data = { chequing: [req.body.chequing] };
  } else if (req.body.savings) {
    $data = { savings: [req.body.savings] };
  } else if (req.body.mortgage) {
    $data = { mortgage: [req.body.mortgage] };
  } else if (req.body.lineOfCredit) {
    $data = { lineOfCredit: [req.body.lineOfCredit] };
  }

  Accounts.findOneAndUpdate(
    { userId: uid },
    {
      $push: $data
    },
    { new: true, upsert: true }
  )
    .then(resp => {
      const { chequing, savings, mortgage, lineOfCredit } = resp;
      res
        .status(201)
        .json([...chequing, ...savings, ...mortgage, ...lineOfCredit]);
    })
    .catch(err => {
      res.status(500).json(err);
      console.log(`Error while creating accounts: ${err}`);
    });
};

const getAccounts = (req, res) => {
  Accounts.findOne({ userId: req.query.userId })
    .then(resp => {
      const { chequing, savings, mortgage, lineOfCredit } = resp;
      res
        .status(201)
        .json([...chequing, ...savings, ...mortgage, ...lineOfCredit]);
    })
    .catch(err => {
      if (err.errors) {
        res.status(500).json(err.errors.message);
      } else {
        res.status(404).json({
          error: {
            errorMsg: `No account found.`
          }
        });
      }
    });
};

const patchAccountBalance = (req, res) => {
  const { uid } = req.body;
  let $findQuery = {};
  let $setQuery = {};

  if (req.body.chequing) {
    $findQuery = {
      userId: uid,
      "chequing.accountNumber": req.body.chequing.accountNumber
    };
    $setQuery = { "chequing.$.credit": req.body.chequing.credit };
  } else if (req.body.savings) {
    $findQuery = {
      userId: uid,
      "savings.accountNumber": req.body.savings.accountNumber
    };
    $setQuery = { "savings.$.credit": req.body.savings.credit };
  } else if (req.body.mortgage) {
    $findQuery = {
      userId: uid,
      "mortgage.accountNumber": req.body.mortgage.accountNumber
    };
    $setQuery = { "mortgage.$.credit": req.body.mortgage.credit };
  } else if (req.body.lineOfCredit) {
    $findQuery = {
      userId: uid,
      "lineOfCredit.accountNumber": req.body.lineOfCredit.accountNumber
    };
    $setQuery = {
      "lineOfCredit.$.credit": req.body.lineOfCredit.credit
    };
  }

  Accounts.findOneAndUpdate(
    $findQuery,
    {
      $set: $setQuery
    },
    { new: true }
  )
    .then(resp => {
      if (resp) {
        const { chequing, savings, mortgage, lineOfCredit } = resp;
        res
          .status(200)
          .json([...chequing, ...savings, ...mortgage, ...lineOfCredit]);
      } else {
        res.status(200).json(resp);
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
};

module.exports = {
  createAccount,
  getAccounts,
  patchAccountBalance
};
