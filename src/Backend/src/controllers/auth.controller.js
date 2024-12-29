const cloudinary = require("../lib/cloudinary");
const generateToken = require("../lib/utils");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

module.exports.signup = async (req, res) => {
    const { fullName, email, password, profilePic } = req.body;

    try {
        if (!fullName || !password || !email)
            return res.status(400).json({ message: "All fields are required" });
        if (password.length < 6)
            return res.status(400).json({
                message: "Password must be atleast 6 characters long",
            });
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: email,
            fullName: fullName,
            password: hashedPassword,
            profilePic: profilePic,
        });
        if (newUser) {
            generateToken(newUser._id, res);
            res.status(201).json({
                email: email,
                fullName: fullName,
                profilePic: profilePic,
            });
            newUser.save().then(console.log("user created successfully"));
        } else res.status(400).json({ message: "Invalid User data" });
    } catch (error) {
        console.log("Error in signUP controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (email.trim() === "")
            return res.status(400).json({ message: "Email cannot be empty." });
        if (password.trim() === "")
            return res
                .status(400)
                .json({ message: "Password cannot be empty." });
        const checkUser = await User.findOne({ email: email });
        if (!checkUser)
            return res.status(400).json({ message: "Invalid Credidantiols." });
        const isPasswordCorrect = await bcrypt.compare(
            password,
            checkUser.password
        );
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Invalid Credidantiols." });

        generateToken(checkUser._id, res);
        res.status(200).json({
            email: checkUser.email,
            fullName: checkUser.fullName,
            profilePic: checkUser.profilePic,
        });
    } catch (error) {
        console.log("Error in signUP controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "logged out successfully" });
    } catch (error) {
        console.log("Error in signUP controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.upadteProfile = async (req, res) => {
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;
        if (!profilePic) {
            res.send(400).json({ message: "Profile pic is required." });
        }
        const uploadRespose = await cloudinary.uploader.upload(profilePic);

        const upateUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePic: uploadRespose.secure_url,
            },
            { new: true }
        );
        res.status(200).json(upateUser);
    } catch (error) {
        console.log("error in the profile pic controller", error.message);
        res.status(500).json({ message: "Internal Server Error." });
    }
};

module.exports.checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in check auth controller", error.message);
        res.status(500).json({ message: "Internal Server Error." });
    }
};
