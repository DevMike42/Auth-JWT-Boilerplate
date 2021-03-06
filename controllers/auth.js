require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = {
  assignToken: async (req, res) => {
    // Checks if validation checks are empty
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure username & password from req.body
    const { username, password } = req.body;

    // Check if user is registered
    try {
      let user = await User.findOne({ username: username });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials: A user with that username does not exist' });
      }

      // If registered > check if password input matches stored data
      const isMatch = await bcrypt.compare(password, user.password);

      // If password is incorrect > send error message
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials: Password is incorrect' });
      }

      // If registers and password matches > login and return token
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
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
  confirmToken: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
};