const bcrypt = require("bcryptjs");
const User = require("../models/User");

const seedAdmin = async () => {
  const email = "admin@gmail.com";
  const password = "865858";
  const role = "admin";

  // Check if admin already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("Admin already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminUser = new User({
    name: "Admin",
    email,
    password: hashedPassword,
    role
  });

  await adminUser.save();
  console.log("Admin user created successfully!");
};

seedAdmin();
