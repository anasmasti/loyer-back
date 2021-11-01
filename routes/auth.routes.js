const getUser = require("../auth/authentification");

const router = express.Router();

router.route("/auth").post(getUser.findUser);

module.exports = router;