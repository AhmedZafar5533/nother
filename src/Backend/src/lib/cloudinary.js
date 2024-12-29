const cloudinary = require("cloudinary").v2;

require("dotenv").config({ path: (__dirname, "../../.env") });

cloudinary.config({
    cloud_name: process.env.CLOUNDNAME,
    api_key: process.env.CLOUDINART_API_KEY,
    api_secret: process.env.API_SECRET,
});

module.exports = cloudinary;
