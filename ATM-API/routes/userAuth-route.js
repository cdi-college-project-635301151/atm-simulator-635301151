const router = require("express").Router();
const {
  login,
  validateKey,
  patchUserPin
} = require("../controllers/userAuth-controller");

router.route("/login").post(login);
router.patch("/pin_update", patchUserPin);
router.get("", validateKey);

module.exports = router;
