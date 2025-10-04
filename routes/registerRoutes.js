const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

// GET registration page
router.get("/register", (req, res) => res.render("register"));

// POST registration
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

    // validations...
    if (!fullname || !email || !phone || !address || !nin || !position || !staffId || !nextOfKin || !nextOfKinPhone || !password || !confirm_password) {
      return res.render("register", { error: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.render("register", { error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
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

    // Log in the user
    req.session.user = newUser;

    // Redirect to staff list
    res.redirect("/stafflist");

  } catch (err) {
    console.error("Registration error:", err);
    res.render("register", { error: "Server error" });
  }
});

router.get("/stafflist", async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render("stafflist", { users, user: req.session.user });
  } catch (err) {
    console.error("Error fetching staff:", err);
    res.status(500).send("Server error");
  }
});

//  GET edit form for a staff member
router.get("/edit/:id", async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).lean();
    if (!staff) return res.status(404).send("Staff not found");

    res.render("staffedit", { staff, user: req.session.user });
  } catch (err) {
    console.error("Error fetching staff for edit:", err);
    res.status(500).send("Server error");
  }
});

// POST update staff
router.post("/edit/:id", async (req, res) => {
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
    } = req.body;

    await User.findByIdAndUpdate(req.params.id, {
      fullname,
      email,
      phone,
      address,
      nin,
      position,
      staffId,
      nextOfKin,
      nextOfKinPhone,
    });

    res.redirect("/staff"); // back to staff list
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).send("Server error");
  }
});

// ✅ POST delete staff
router.post("/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/staff");
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;



