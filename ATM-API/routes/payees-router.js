const router = require("express").Router();
const {
  createPayee,
  getPayees,
  patchPayee
} = require("../controllers/payees-controller");
const { route } = require("./userAuth-route");

router.get("/payees", getPayees);
router.post("/create", createPayee);
router.patch("/patch-payee", patchPayee);

module.exports = router;
