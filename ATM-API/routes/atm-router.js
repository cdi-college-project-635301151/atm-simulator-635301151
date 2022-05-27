const router = require("express").Router();
const {
  createATM,
  postTransaction,
  getAtm,
  getAtmTransactions,
  patchAtmStatus
} = require("../controllers/atm-controller");

router.post("/create", createATM);
router.post("/transactions/post", postTransaction);
router.get("", getAtm);
router.get("/transactions", getAtmTransactions);
router.patch("/patch-status", patchAtmStatus);

module.exports = router;
