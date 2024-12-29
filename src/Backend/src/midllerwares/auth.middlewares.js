const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token)
            return res.status(401).json({
                message: "Unauthorized access. User not logged in.",
            });

        const decodedJwt = await jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedJwt)
            return res.status(401).json({ message: "Unauthorized access." });

        const user = await User.findById(decodedJwt.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found." });

        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protect route middleware: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = protectRoute;
