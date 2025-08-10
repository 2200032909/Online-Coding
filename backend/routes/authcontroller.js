const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashed, role: 'user' });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.role === 'admin') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;
      await user.save();

      await sendOTP(email, otp);

      const tempToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '10m' });
      return res.json({ otpSent: true, role: 'admin', token: tempToken });
    } else {
// For both admin and user token
const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, role: user.role });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') return res.status(401).json({ message: 'Unauthorized' });

    const { otp } = req.body;

    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const finalToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token: finalToken });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

const sendOTP = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

   transporter.sendMail({
    from: process.env.MAIL_USER,
    to : '2200032909cseh@gmail.com',
    subject: 'Your Admin OTP Code',
    text: `Your OTP is ${otp}`,
  });
};
