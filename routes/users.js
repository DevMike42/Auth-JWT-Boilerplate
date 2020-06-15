const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { check } = require('express-validator');

// @route         GET api/users
// @description   Get logged in User info
// @access        Private
router.get('/:id', (req, res) => {
  res.send('Get logged in User Info');
});

// @route         POST api/users
// @description   Register a User
// @access        Public
router.route('/')
  .post([
    // Validation checks on user input using express-validator
    check('username', 'Please add a name')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email')
      .isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
      .isLength({ min: 6 })
  ], usersController.create);

// @route         PUT api/users
// @description   Update User info
// @access        Private
router.put('/:id', (req, res) => {
  res.send('Update User info');
});

// @route         DELETE api/users
// @description   Delete a User
// @access        Private
router.delete('/:id', (req, res) => {
  res.send('Delete a User');
});

module.exports = router;