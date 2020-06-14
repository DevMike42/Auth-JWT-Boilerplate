const express = require('express');
const router = express.Router();

// @route         GET api/users
// @description   Get logged in User info
// @access        Private
router.get('/:id', (req, res) => {
  res.send('Get logged in User Info');
});

// @route         POST api/users
// @description   Register a User
// @access        Public
router.post('/', (req, res) => {
  res.send('Register a User');
});

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