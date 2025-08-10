const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Submission = require("../models/submission");
const { authenticate, authorizeRole } = require("../middleware/auth");

// Get all users with count of solved problems

router.get("/", authenticate, authorizeRole("admin"), async (req, res) => {
  try {
    // Get all users excluding admins
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");

    // For each user, count how many problems they've solved
    const usersWithSolvedCount = await Promise.all(
      users.map(async (user) => {
        const solvedCount = await Submission.distinct("problemId", {
          userId: user._id,
          status: "passed",
        }).then((problems) => problems.length);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          problemsSolved: solvedCount,
        };
      })
    );

    res.json(usersWithSolvedCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (exclude password)
router.get("/:id", authenticate, authorizeRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user info
router.put("/:id", authenticate, authorizeRole("admin"), async (req, res) => {
  try {
    const updates = { ...req.body };

    // Hash password if provided
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user by ID
router.delete("/:id", authenticate, authorizeRole("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/submissions', async (req, res) => {
  try {
    console.log('Fetching submissions...');
    const submissions = await Submission.find()
      .populate('userId', 'name email')
      .populate('problemId', 'title'); 

    if (!submissions.length) {
      return res.status(404).json({ message: 'No submissions found' });
    }

    console.log(`Found ${submissions.length} submissions.`);
    return res.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ message: 'Server error while fetching submissions' });
  }
});
module.exports = router;
