const express = require("express");
const protectRoute = require("../midllerwares/auth.middlewares");
const {getSidebarUsers, loadingMessages, sendMessage} = require("../controllers/messages.controller");

const router = express.Router();
router.get("/users", protectRoute, getSidebarUsers);
router.get("/:id", protectRoute, loadingMessages);
router.post('/send/:id', protectRoute, sendMessage)

module.exports = router;
