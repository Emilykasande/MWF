const express = require("express");
const router = express.Router();

//getting the manager_signup form.
router.get("/index", (req, res) => {
  // Set cache control to prevent caching of the index page
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.render("index", { title: "sales" });
});

router.post("/index", (req, res) => {
  console.log(req.body);
});

// GET search demo page
router.get("/search-demo", (req, res) => {
  res.render("search-demo", { title: "Search Demo" });
});

module.exports = router;
