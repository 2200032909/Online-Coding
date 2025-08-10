// seedAdmin.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Load the User model
const User = require("../models/User");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    const hashedPassword = await bcrypt.hash("865858", 10);

    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("Admin already exists");
    } else {
      const admin = new User({
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin"
      });

      await admin.save();
      console.log("✅ Admin created successfully");
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
