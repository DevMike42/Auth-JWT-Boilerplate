const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { check } = require('express-validator');
const auth = require('../middleware/auth');

// @route         GET api/auth
// @description   Get logged in User
// @access        Private
router.get('/', auth, authController.confirmToken);

// @route         POST api/auth
// @description   Auth user & get token
// @access        Public
router.post('/', [
  // Validation checks on user input using express-validator
  check('username', 'Please include a valide username')
    .exists(),
  check('password', 'Password is required')
    .exists()
], authController.assignToken);

module.exports = router;