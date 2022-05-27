const Users = require("../models/users");
const jwt = require("jsonwebtoken");
const userAuthSchema = require("../models/userAuth");
require("dotenv").config("../.env");
const crypto = require("crypto");
const moment = require("moment");
const apiConfig = require("../models/apiConfig");

// TO IMPLEMENT JWT AUTHENTICATION
const auth = (req, res) => {
  const { userCode, userPin } = req.body;

  Users.findOneAndUpdate(
    {
      "userAuth.userCode": userCode,
      "userAuth.userPin": userPin,
      isBlocked: false,
      isEnabled: true
    },
    { $set: { "userAuth.lastLogin": Date.now() } },
    {
      returnDocument: "after",
      $unwind: "$userAuth",
      projection: {
        _id: 0,
        "userAuth.userCode": 1,
        "userAuth.pinUpdate": 1,
        "userAuth.userType": 1,
        "userAuth.lastLogin": 1
      }
    }
  )
    .then(resp => {
      if (resp) {
        const { userAuth } = resp;
        const user = {
          userCode: userAuth.userCode,
          pinUpdate: userAuth.pinUpdate,
          userType: userAuth.userType,
          lastLogin: userAuth.lastLogin
        };

        const token = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h"
        });

        res.status(200).json(token);
      } else {
        res.status(401).json({
          message: "Invalid User Code or User Pin."
        });
      }
    })
    .then(err => {
      res.status(500).json(err);
    });
};

const login = (req, res) => {
  const { userCode, userPin } = req.body;
  const apiKey = generateKey();
  const expiredAt = ExpiredAt(30);
  //isBlocked: false,
  Users.findOneAndUpdate(
    { "userAuth.userCode": userCode, isEnabled: true },
    {
      $set: {
        "userAuth.apiConfig.apiKey": apiKey,
        "userAuth.apiConfig.expiredAt": expiredAt
      }
    },
    { new: true, fields: { "userAuth.userpin": 0 } }
  )
    .then(resp => {
      console.log("login ->", resp);
      console.log("userAuth ->", resp.userAuth);

      const { _id, userAuth } = resp;
      const attemps = userAuth.attemps + 1;
      const isBlocked = userAuth.isBlocked;

      if (isBlocked) {
        res.status(401).json({
          attemps: attemps,
          errorMessage:
            "Account has been blocked. Please contact support for information."
        });
        return;
      }

      if (userAuth.userPin != userPin && userAuth.attemps !== 3) {
        userAuth.attemps = attemps;
        updateAtteps(userCode, attemps);

        res.status(401).json({
          attemps: attemps,
          errorMessage: "User Code or User PIN is incorrect, please try again."
        });
        return;
      }

      if (userAuth.userPin === userPin) {
        userAuth.attemps = 0;
        updateAtteps(userCode, 0);
        res.status(200).json(resp);
        return;
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        attemps: 0,
        errorMessage: "User Code or User PIN is incorrect, please try again."
      });
    });
};

const updateAtteps = async (userCode, attemps) => {
  const isBlocked = attemps === 3 ? 1 : 0;
  Users.findOneAndUpdate(
    { "userAuth.userCode": userCode },
    {
      $set: {
        "userAuth.attemps": attemps,
        "userAuth.isBlocked": isBlocked,
        "userAuth.lastLogin": Date.now()
      }
    },
    { new: true, "userAuth.userPin": 0 }
  )
    .then(resp => {
      const { userAuth } = resp;

      console.log("attemps ->", userAuth);
    })
    .catch(err => {
      console.log(err);
    });
};

const validateKey = (req, res) => {
  const apiKey = req.query.token;
  Users.findOne(
    { "userAuth.apiConfig.apiKey": apiKey },
    {
      "userAuth.userPin": 0,
      "userAuth.userCode": 0
    }
  )
    .then(resp => {
      console.log(resp);
      res.status(200).json(resp);
    })
    .catch(err => {
      const error = err;
      res.status(500).json({
        errorMessage: error.length > 0 ? error : `Invalid token.`
      });
    });
};

const patchUserPin = (req, res) => {
  const { userAuth } = req.body;

  /**
   * SIMPLE PIN UPDATE ONLY
   * NO VALIDATION
   * WILL ADD NEW FEATURES IN PRODUCTION
  */

  Users.findOneAndUpdate(
    { "userAuth._id": userAuth._id },
    {
      $set: {
        "userAuth.userPin": userAuth.userPin,
        "userAuth.pinUpdate": false
      }
    },
    {
      new: true,
      "userAuth.userPin": 0,
      "userAuth.userCode": 0
    }
  )
    .then(resp => {
      res.status(201).json(resp);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
};

const generateKey = () => {
  const current_date = moment.utc().valueOf().toString();
  const random = Math.random().toString();
  const apiKey = crypto
    .createHash("sha1")
    .update(current_date + random)
    .digest("hex")
    .toString();
  return apiKey;
};

const ExpiredAt = minuites => {
  const newDate = moment.utc().add(minuites, "minutes");
  return newDate;
};

module.exports = { login, validateKey, patchUserPin };
