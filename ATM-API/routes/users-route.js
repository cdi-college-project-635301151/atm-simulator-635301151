const router = require("express").Router();

const {
  createUser,
  getUsers,
  getUser,
  updateUserInfo,
  updateAccess
} = require("../controllers/users-controller");

router.route("").get(getUser);

router.route("/get_users").get(getUsers);
router.route("/create").post(createUser);
router.route("/update/basic_info").post(updateUserInfo);
router.patch("/update/user-access", updateAccess);

module.exports = router;
