const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt"); 


const UserModel = require("../models/userModel");

router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      address,
      nin,
      position,
      staffId,
      nextOfKin,
      nextOfKinPhone,
      password,
      confirm_password,
    } = req.body;

    // Validate required fields
    if (
      !fullname ||
      !email ||
      !phone ||
      !address ||
      !nin ||
      !position ||
      !staffId ||
      !nextOfKin ||
      !nextOfKinPhone ||
      !password ||
      !confirm_password
    ) {
      return res.render("register", { error: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.render("register", { error: "Passwords do not match" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      fullname,
      email,
      phone,
      address,
      nin,
      position,
      staffId,
      nextOfKin,
      nextOfKinPhone,
      password: hashedPassword,
    });

    await newUser.save();
    res.redirect("/login"); // registration successful, go to login
  } catch (error) {
    console.error("Registration error:", error);
    res.render("register", { error: "Server error, try again" });
  }
});


router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);

    // Set cache control headers to prevent caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    res.redirect("/index");
  });
});


router.get("/addsale", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.position !== "sales Agent") {
    return res
      .status(403)
      .send("Access denied: Only Sales Agents can access this page");
  }

  console.log("Reached /addsale for:", req.session.user.fullname);
  res.render("addsale", { title: "Add Sale" });
});

module.exports = router;
