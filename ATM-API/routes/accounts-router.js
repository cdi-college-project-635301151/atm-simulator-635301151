const router = require("express").Router();
const {
  createAccount,
  getAccounts,
  patchAccountBalance
} = require("../controllers/accounts-controller");

router.get("", getAccounts);
router.post("/create", createAccount);
router.patch("/patch-balance", patchAccountBalance);

module.exports = router;
