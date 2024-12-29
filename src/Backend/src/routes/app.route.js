const express = require("express");
const {
    login,
    logout,
    signup,
    upadteProfile,
    checkAuth,
} = require("../controllers/auth.controller");
const protectRoute = require("../midllerwares/auth.middlewares");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);
router.put("/update-profile", protectRoute, upadteProfile);

router.get("/check", protectRoute, checkAuth);

module.exports = router;
