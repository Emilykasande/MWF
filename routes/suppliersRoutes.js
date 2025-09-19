const express = require("express");
const router = express.Router();

//getting the manager_signup form.
router.get("/suppliers", (req, res) => {
  res.render("suppliers", { title: "suppliers report" });
});

router.post("/suppliers", (req, res) => {
  console.log(req.body);
});

module.exports = router;
