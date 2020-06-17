require('dotenv').config();
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  create: async (req, res) => {

    // Checks if validation checks are empty
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure needed input from req.body
    const { username, email, fullName, password } = req.body;

    try {

      // Check if username is already in db
      let user = await User.findOne({ username: username });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create new instance of a User
      user = new User({
        username: username,
        email: email,
        fullName: fullName,
        password: password
      });

      // Generate a salt for hashing password
      const salt = await bcrypt.genSalt(10);

      // Hash password using bcryptjs to be stored in DB
      user.password = await bcrypt.hash(password, salt);

      // Save user to DB
      await user.save();

      // Store user id in jwt payload
      const payload = {
        user: {
          id: user.id
        }
      };

      // Add payload and jwtSecret to token and send back
      jwt.sign(payload, JWT_SECRET, {
        expiresIn: 36000
      }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });

    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },
  updateUser: async (req, res) => {
    const { username, email, fullName, password } = req.body;

    const updatedUser = {};
    if (username) updatedUser.username = username;
    if (email) updatedUser.email = email;
    if (fullName) updatedUser.fullName = fullName;
    if (password) updatedUser.password = password;

    try {
      let user = await User.findById(req.params.id);

      user = await User.findByIdAndUpdate(req.params.id,
        { $set: updatedUser },
        { new: true });

      res.json({ msg: 'User info updated successfully!' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
  removeUser: async (req, res) => {
    await User.findByIdAndRemove(req.params.id);

    res.json({ msg: 'User account has been removed' });
  }
};