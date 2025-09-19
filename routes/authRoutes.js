const express = require("express");
const router = express.Router();
const passport = require("passport");


const UserModel = require("../models/userModel");
router.get("/register", (req, res) => {
  res.render("register", { title: "Register" });
});

router.post("/register", async (req, res) => {
  try {
    const user = new UserModel(req.body);

    let existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send("User already registered");
    }

    await UserModel.register(user, req.body.password, (error) => {
      if (error) throw error;
      res.redirect("/login");
    });
  } catch (error) {
    console.error(error);
    res.status(400).send("Try again");
  }
});
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    console.log("Logged-in user position:", user.position);
    req.session.user = user;
    req.session.save((err) => {
      if (err) console.error("Session save error:", err);
    });

    if (user.position === "sales Agent") {
      return res.redirect("/addsale");
    } else if (user.position === "manager") {
      return res.redirect("/stock");
    } else {
      return res.status(403).render("noneuser");
      }
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Logout error:", err);
    res.redirect("/login");
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
