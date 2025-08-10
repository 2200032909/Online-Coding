const express = require('express');
const router = express.Router();
const { register, login, verifyOtp } = require('../routes/authcontroller');
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Submission = require('../models/submission'); // ⬅ Import Submission model

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

// GET /me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /submissions
router.get('/submissions', authenticate, async (req, res) => {
  try {
    // Find all passed submissions by this user, sorted by submittedAt desc
    const submissions = await Submission.find({
      userId: req.user._id,
      status: 'passed'
    })
      .sort({ submittedAt: -1 })
      .populate('problemId', 'title description') // populate problem title and description
      .lean();

    res.json({ submissions });  // Return all submissions, not grouped
  } catch (error) {
    console.error('Error fetching solved problems:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
