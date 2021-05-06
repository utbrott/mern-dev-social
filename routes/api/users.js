const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/',[
  check(
    'name',
    'Name is required').not().isEmpty(),
  check(
    'email',
    'Please include a valid email adress').isEmail(),
  check(
    'password',
    'Enter a password with 8 or more characters').isLength({ min: 8 })
],
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {name, email, password} = req.body;

  try {
    // Check is user exists
    let user = await User.findOne({ email });
    if(user) {
      return res.status(400).json({ errors: [{ msg: 'User already registered' }] });
    }

    const avatar = gravatar.url(email, {
      s: '200', r: 'pg', d: 'mm'
    });

    user = new User({
      name, email, avatar, password
    });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.send('User registered');
  }
  catch(err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

