import { User } from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import createTokenAndSaveCookies from "../jwt/AuthToken.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("JWT Secret:", process.env.JWT_SECRET);

    // Check if photo is present
    if (!req.files || !req.files.photo) {
      return res.status(400).json({ message: "User photo is required" });
    }

    const { photo } = req.files;
    const allowedFormats = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedFormats.includes(photo.mimetype)) {
      return res.status(400).json({ message: "Invalid photo format" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Upload to Cloudinary
    const cloudinaryRes = await cloudinary.uploader.upload(photo.tempFilePath);
    if (!cloudinaryRes || cloudinaryRes.error) {
      return res.status(500).json({ message: "Photo upload failed" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      photo: {
        public_id: cloudinaryRes.public_id,
        url: cloudinaryRes.secure_url,
      },
    });

    // Create token
    const token = await createTokenAndSaveCookies(newUser._id, res);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        photo: newUser.photo,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user & include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Create token
    const token = await createTokenAndSaveCookies(user._id, res);

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo, // will be null if not uploaded
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
