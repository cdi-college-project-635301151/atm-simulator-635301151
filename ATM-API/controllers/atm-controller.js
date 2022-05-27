const ATM = require("../models/atm");

const createATM = (req, res) => {
  const { atmCode, atmName } = req.body;
  const atm = new ATM({
    atmCode: atmCode,
    atmName: atmName
  });

  atm
    .save()
    .then(resp => {
      res.status(201).json(resp);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        errMessage: "An error occured while creating the ATM",
        error: err
      });
    });
};

const postTransaction = (req, res) => {
  const { _id, history } = req.body;
  const { value, accountNumber } = history;

  console.log(req.body);

  ATM.findOneAndUpdate(
    { _id: _id },
    { $push: { history: [{ value: value, accountNumber: accountNumber }] } },
    { returnDocument: "after" }
  )
    .then(resp => {
      const { history } = resp;
      const sum = history.reduce((acc, obj) => {
        return acc + obj.value;
      }, 0);

      ATM.findOneAndUpdate(
        { _id: _id },
        { $set: { balance: sum } },
        { new: true }
      )
        .then(resp => {
          const { history } = resp;
          res.status(201).json(history);
        })
        .catch(err => {
          res.status(500).json(err);
        });
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const getAtm = (req, res) => {
  ATM.findOne({}, { history: 0, archive: 0 })
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const getAtmTransactions = (req, res) => {
  ATM.findById(req.query._id)
    .then(resp => {
      const { history } = resp;
      console.log(history);
      res.status(200).json(history);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const patchAtmStatus = (req, res) => {
  const { _id, isOpen } = req.body;
  ATM.findByIdAndUpdate(_id, { isOpen: isOpen }, { new: true })
    .then(resp => {
      res.status(201).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

module.exports = {
  createATM,
  postTransaction,
  getAtm,
  getAtmTransactions,
  patchAtmStatus
};
