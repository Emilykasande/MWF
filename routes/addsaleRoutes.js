const express = require("express");
const router = express.Router();

//getting the manager_signup form.
router.get("/addsale", (req, res) => {
  res.render("addsale", { title: "sales" });
});

router.post("/addsale", (req, res) => {
  console.log(req.body);
});a


module.exports = router;
