const express = require('express');
const router = express.Router();

// @route         GET api/auth
// @description   Get logged in User
// @access        Private
router.get('/', (req, res) => {
  res.send('Get logged in User');
});

// @route         POST api/auth
// @description   Auth user & get token
// @access        Public
router.post('/', (req, res) => {
  res.send('Log in User');
});

module.exports = router;