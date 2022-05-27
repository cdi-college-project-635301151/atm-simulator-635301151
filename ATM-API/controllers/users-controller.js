const Users = require("../models/users");
const verifyToken = require("./check-token");

const createUser = (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    address,
    userAuth
  } = req.body;

  const { userCode, userPin } = userAuth;
  const { streetAddress, addressDesc, city, province, postal } = address;

  const user = new Users({
    userAuth: {
      userCode: userCode,
      userPin: userPin
    },
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
    address: {
      streetAddress: streetAddress,
      addressDesc: addressDesc,
      city: city,
      province: province,
      postal: postal
    }
  });

  user
    .save()
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const getUsers = (req, res) => {
  Users.find(
    { "userAuth.userType": "001" },
    { userAuth: { userPin: 0, userCode: 0 } }
  )
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const getUser = (req, res) => {
  Users.findById(req.query._id, { userAuth: { userPin: 0, userCode: 0 } })
    .then(resp => {
      res.status(200).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const updateUserInfo = (req, res) => {
  const { _id, firstName, lastName, phoneNumber, email, address } = req.body;
  const { streetAddress, addressDesc, city, province, postal } = address;
  console.log(req.body);

  const update = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    phoneNumber: phoneNumber,
    address: {
      streetAddress: streetAddress,
      addressDesc: addressDesc,
      city: city,
      province: province,
      postal: postal
    }
  };

  Users.findOneAndUpdate({ _id: _id }, update, { userAuth: 0 })
    .then(resp => {
      console.log(resp);
      res.status(201).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

const updateAccess = (req, res) => {
  const { _id, isBlocked } = req.body;
  console.log(req.body);
  Users.findByIdAndUpdate(
    _id,
    { "userAuth.isBlocked": isBlocked },
    { new: true, fields: { "userAuth.userPin": 0, "userAuth.userCode": 0 } }
  )
    .then(resp => {
      console.log({ user: resp });
      res.status(201).json(resp);
    })
    .catch(err => {
      res.status(500).json(err);
      console.log(err);
    });
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUserInfo,
  updateAccess
};
