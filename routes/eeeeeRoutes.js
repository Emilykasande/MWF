// const express = require("express");
// const router = express.Router();
// const multer = require("multer");

// //image upload settings
// let storage = multer.diskStorage({
//   destination:(req,file, cb) => {
//     cb(null, "/uploads");
//   },
//   filename:(req, file, cb) => {
//     cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//   }
// });
// const upload = multer({storage: storage});

// //getting the manager_signup form.
// router.get("/shopping", (req, res) => {
//   res.render("ecommerce", { title: "online shop" });
// });

// // router.post("/shopping", upload.single("image"),async (req, res) => {
// //   try {
// //     const stock = new stockModel(req.body);
// //     stock.image = req.file.path;
// //     await stock.save();
// //     res.redirect("/shopping");
// //   }
// // }; catch (error) {
// //     res.status(400).send("unable to save to database");
// //     console.log(error);
// //   }
// // );

// // router.post("/ecommerce", upload.single("image")(req, res) => {
// //   // console.log(req.body);
// //   stockModel.image = req.file.path;
// // });
