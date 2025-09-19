const express = require("express");
const router = express.Router();

//syntax of a route
//app.METHOD(PATH,HANDLE);

// Simple request time logger
// app.use((req, res, next) => {
//    console.log("A new request received at " + Date.now());

//      // This function call tells that more processing is
//    // required for the current request and is in the next middleware
//    //function/route handler.
//    next();
// });

//Simple request time logger for a specific route
router.use("/home", (req, res, next) => {
  console.log("A new request received at " + Date.now());
  next();
});

// routing
router.get("/home", (req, res) => {
  res.send("home page. Nice.");
});

router.get("/about", (req, res) => {
  res.send("About page. Nice.");
});

router.get("/Emily", (req, res) => {
  res.send("This is Emily's page. Nice.");
});

// wednesday
router.post("/about", (req, res) => {
  res.send("Got a POST request");
});

router.put("/user", (req, res) => {
  res.send("Got a PUT request at /user");
});

router.delete("/user", (req, res) => {
  res.send("Got a DELETE request at /user");
});

// path parameters
router.get("/pathparams/:username", (req, res) => {
  res.send("This is the user name " + req.params.username);
});

// query strings
router.get("/students", (req, res) => {
  res.send(
    "This is " +
      req.query.name +
      " from cohort " +
      req.query.cohort +
      " class of " +
      req.query.class
  );
});

// serving html files
router.get("/", (req, res) => {
  res.sendFile(__dirname + "/HTML/index.html");
});

// be able to get the form
router.get("/registeruser", (req, res) => {
  res.sendFile(__dirname + "/HTML/form.html");
});

// post route (form submission)
router.post("/registeruser", (req, res) => {
  console.log(req.body); // username will show here in terminal
  res.send();
});

router.get("/manager-signup", (req, res) => {
  res.sendFile(__dirname + "/HTML/manager_signup.html");
});

router.post("/manager-signup", (req, res) => {
  console.log(req.body);
});


module.exports = router;
