const router = require("express").Router();
const {
  postAccountTransactions,
  getAccountTransactions
} = require("../controllers/accounts-transaction-controller");

router.post("/post", postAccountTransactions);
router.get("", getAccountTransactions);

module.exports = router;
