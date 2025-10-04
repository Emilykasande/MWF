const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// GET login page
router.get("/login", (req, res) => {
  res.render("login"); // login.pug
});

// POST login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Enhanced validation with specific error messages
    if (!email && !password) {
      return res.render("login", {
        error: "Both email and password are required",
        email: "",
        password: "",
      });
    }

    if (!email) {
      return res.render("login", {
        error: "Email address is required",
        email: "",
        password: password || "",
      });
    }

    if (!password) {
      return res.render("login", {
        error: "Password is required",
        email: email,
        password: "",
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render("login", {
        error: "Please enter a valid email address",
        email: email,
        password: password,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.render("login", {
        error: "No account found with this email address. Please check your email or register a new account.",
        email: email,
        password: "",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.render("login", {
        error: "Incorrect password. Please try again or reset your password.",
        email: email,
        password: "",
      });
    }

    // Set session
    req.session.user = {
      id: user._id,
      fullname: user.fullname,
      position: user.position,
      email: user.email,
    };

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.render("login", {
          error: "Login session error. Please try again.",
          email: email,
          password: "",
        });
      }

      // Redirect based on user role
      if (req.session.user.position === "manager") {
        return res.redirect("/dashboard");
      } else if (req.session.user.position === "sales Agent") {
        return res.redirect("/addsale");
      } else {
        return res.status(403).render("noneuser");
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.render("login", {
      error: "Server error occurred. Please try again later.",
      email: email || "",
      password: "",
    });
  }
});

// GET logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);

    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.redirect("/index");
  });
});

module.exports = router;
