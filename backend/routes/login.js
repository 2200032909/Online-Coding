const router = require("express").Router();
const sendEmail = require("../routes/Sendemail");

const otpStore = require("../utils/otpStore"); // if stored separately

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile' });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "865858") {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🧠 Log OTP for development
    console.log("Generated OTP for admin:", otp);

    otpStore[email.toLowerCase()] = {
      otp,
      createdAt: Date.now()
    };

    try {
      await sendEmail(
        "2200033061cseh@gmail.com", // static target email
        "Admin Login OTP",
        `Your OTP is ${otp}`
      );
      return res.status(200).json({ message: "OTP sent to admin email" });
    } catch (err) {
      console.error("Email sending failed:", err.message);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  }

  // Non-admin user logic (register or normal login)
  res.status(401).json({ message: "Invalid credentials" });
});

// Verify OTP Route
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore[email.toLowerCase()];
  if (!stored) {
    return res.status(400).json({ message: "No OTP found for this email" });
  }

  const isExpired = Date.now() - stored.createdAt > 5 * 60 * 1000; // 5 minutes
  if (isExpired) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ message: "OTP expired" });
  }

  if (stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // ✅ OTP verified successfully
  delete otpStore[email.toLowerCase()];
  return res.status(200).json({ message: "OTP verified. Login successful!" });
});

