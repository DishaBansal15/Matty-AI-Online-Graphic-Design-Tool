import express from "express";
import { login, logout, register } from "../controller/usercontroller.js";
import { isAuthenticated } from "../middleware/authUser.js";
import passport from "passport";
import { User } from "../models/usermodel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY,
});

const router = express.Router();

router.put("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update username if provided
    if (req.body.username) {
      user.username = req.body.username;
    }

    // Remove avatar if requested
    if (req.body.removeAvatar === "true") {
      user.avatarUrl = "";
    }

    // Upload new avatar if provided
    if (req.files?.avatar) {
  const file = req.files.avatar;
  const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: "avatars",
    public_id: `${req.user._id}_avatar`,
    overwrite: true,
  });
  user.avatarUrl = uploaded.secure_url;
}


    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    // send HTML page to postMessage token back to opener
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage(
              {
                token: "${req.user.token}",
                user: ${JSON.stringify(req.user)}
              },
              "http://localhost:5173"
            );
            window.close();
          </script>
        </body>
      </html>
    `);
  }
);


// ✅ Auth Routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);

export default router;
