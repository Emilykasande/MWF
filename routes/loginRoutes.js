const express = require("express");

const passport = require("passport");
const router = express.Router();

// GET login page
router.get("/login", (req, res) => {
  res.render("login"); // login.pug
});

// POST login with Passport
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login", // back to login if fail
    failureFlash: true, // optional if you use flash messages
  }),
  (req, res) => {
    // At this point user is authenticated
    console.log("Logged-in user position:", req.user.position);

    if (req.user.position === "manager") {
      return res.redirect("/stock");
    } else if (req.user.position === "sales Agent") {
      return res.redirect("/addsale");
    } else {
      return res.status(403).render("noneuser");
    }
  }
);

// GET logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect("/login");
  });
});



module.exports = router;
