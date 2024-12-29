const Message = require("../models/messages");
const User = require("../models/user.model");
const cloudinary = require("../lib/cloudinary");
const { getSocketId, io } = require("../lib/socket");

const getSidebarUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
            "-password"
        );
        res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
        console.log("error in get side users controller: ", error.message);
    }
};



const loadingMessages = async (req, res) => {
    try {
        const receiverId = req.params.id;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receicerId: receiverId },
                { senderId: receiverId, receicerId: myId },
            ],
        });

        if (messages.length > 0) {
            return res.status(200).json(messages);
        } else {
            return res.status(404).json({ message: "No messages found" });
        }
    } catch (error) {
        console.error("Error in loading messages controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const receicerId = req.params.id;
        const senderId = req.user._id;
        let imageUrl;
        if (image) {
            const uploadImage = await cloudinary.uploader.upload(image);
            imageUrl = await uploadImage.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receicerId,
            text,
            image: imageUrl,
        });

        await newMessage.save();
        const receiverSocketId = getSocketId(receicerId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("error in sending messages controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getSidebarUsers, loadingMessages, sendMessage };
