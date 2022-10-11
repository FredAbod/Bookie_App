const router = require("express").Router();
const {
    adminSignUp,
    adminLogin,
    addServices,
  } = require("../controllers/admin.controller");
  const upload = require('../utils/multer');

  router.post("/signup", adminSignUp);
router.post("/login", adminLogin);
router.post("/addservices", upload.single('image'), addServices);


module.exports = router;