const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    bio: user.bio,
  };
}

// Register
router.post("/register", async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    name = typeof name === "string" ? name.trim() : "";
    email = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!name || !email || typeof password !== "string") {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    if (name.length > 60 || email.length > 254) {
      return res.status(400).json({ message: "Input is too long." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters.",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    setAuthCookie(res, createToken(user._id.toString()));

    return res.status(201).json({
      message: "Account created successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    next(error);
  }
});

// Login
router.post("/login", async (req, res, next) => {
  try {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
  return res.status(404).json({
    message: "Account not found. Please create an account first.",
  });
}

if (!(await bcrypt.compare(password, user.password))) {
  return res.status(401).json({
    message: "Incorrect password. Please try again.",
  });
}

    setAuthCookie(res, createToken(user._id.toString()));

    return res.json({
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// Get the currently authenticated user
router.get("/me", async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please sign in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    return res.json({ user: publicUser(user) });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Please sign in again." });
    }

    next(error);
  }
});

// Update profile
router.patch("/profile", async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please sign in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    const { name, phone, bio } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length > 60) {
        return res.status(400).json({ message: "Please enter a valid name." });
      }
      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== "string" || phone.length > 20) {
        return res.status(400).json({ message: "Please enter a valid phone number." });
      }
      user.phone = phone.trim();
    }

    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.length > 200) {
        return res.status(400).json({ message: "Your bio must be under 200 characters." });
      }
      user.bio = bio.trim();
    }

    await user.save();

    return res.json({
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Please sign in again." });
    }

    next(error);
  }
});

// Change password
router.patch("/password", async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please sign in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Account not found." });
    }

    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({ message: "Please fill in both password fields." });
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Your current password is incorrect." });
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        message: "New password must be between 8 and 128 characters.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" });

    return res.json({
      message: "Password changed. Please sign in again.",
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Please sign in again." });
    }

    next(error);
  }
});

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({ message: "Logged out successfully." });
});

module.exports = router;