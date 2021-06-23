import { Router } from 'express';
const router = Router();
import { url } from 'gravatar';
import { genSalt, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { get } from 'config';
import { check, validationResult } from 'express-validator';

import User, { findOne } from '../../models/User';

// route:   POST api/users
// desc:    Register user
// access:  Public
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email adress').isEmail(),
    check('password', 'Enter a password with 8 or more characters').isLength({
      min: 8,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check is user exists
      let user = await findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already registered' }] });
      }

      const avatar = url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await genSalt(10);
      user.password = await hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      sign(payload, get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

export default router;
