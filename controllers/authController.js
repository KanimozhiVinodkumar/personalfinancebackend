const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path based on your folder

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // 4. Return success response
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};
