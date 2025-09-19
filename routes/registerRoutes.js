const express = require("express");
const router = express.Router();

//getting the register form.
router.get("/register", (req, res) => {
  res.render("register", { title: "register" });
});

router.post("/register", (req, res) => {
  console.log(req.body);
});

module.exports = router;
