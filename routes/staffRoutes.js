const express = require("express");
const router = express.Router();
const Staff = require("../models/userModel");
const { ensureManager } = require("../middleware/auth"); // your manager auth middleware

// GET all staff (table)
router.get("/stafflist", async (req, res) => {
  try {
    // Sort by creation date descending (newest first)
    const users = await Staff.find({}).sort({ createdAt: -1 }).lean();

    // Check for success message in query params
    const success = req.query.success;

    res.render("stafflist", {
      users,
      user: req.session.user,
      success: success
    });
  } catch (err) {
    console.error("Error loading staff list:", err);
    res.status(500).render("error", {
      message: "Error loading staff list",
      error: { status: 500 }
    });
  }
});



// GET edit page
router.get("/staff/edit/:id", ensureManager, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).lean();
    if (!staff) {
      return res.status(404).render("error", {
        message: "Staff member not found",
        error: { status: 404 }
      });
    }
    res.render("staffedit", { staff, user: req.session.user });
  } catch (err) {
    console.error("Error loading staff for edit:", err);
    res.status(500).render("error", {
      message: "Error loading staff member",
      error: { status: 500 }
    });
  }
});

// POST update staff
router.post("/staff/edit/:id", ensureManager, async (req, res) => {
  try {
    const { fullname, email, phone, address, nin, staffId, position, nextOfKin, nextOfKinPhone } = req.body;

    // Validate required fields
    if (!fullname || !email || !phone || !position) {
      return res.status(400).render("staffedit", {
        staff: { ...req.body, _id: req.params.id },
        error: "Full name, email, phone, and position are required"
      });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        fullname,
        email,
        phone,
        address,
        nin,
        staffId,
        position,
        nextOfKin,
        nextOfKinPhone,
      },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).render("error", {
        message: "Staff member not found",
        error: { status: 404 }
      });
    }

    res.redirect("/stafflist?success=Staff member updated successfully");
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).render("staffedit", {
      staff: { ...req.body, _id: req.params.id },
      error: "Error updating staff member. Please try again."
    });
  }
});

// POST delete staff
router.post("/staff/delete/:id", ensureManager, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff member not found" });
    }

    res.redirect("/stafflist?success=Staff member deleted successfully");
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ success: false, message: "Error deleting staff member" });
  }
});

module.exports = router;
