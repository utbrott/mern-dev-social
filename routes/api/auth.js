import { Router } from 'express';
const router = Router();
import { compare } from 'bcryptjs';
import auth from '../../middleware/auth';
import { findById, findOne } from '../../models/User';
import { sign } from 'jsonwebtoken';
import { get } from 'config';
import { check, validationResult } from 'express-validator';

// route:   GET api/auth
// desc:    Auth route
// access:  Protected
router.get('/', auth, async (req, res) => {
  try {
    const user = await findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// route:   POST api/auth
// desc:    Authenticate user & get token
// access:  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email adress').isEmail(),
    check('password', 'Password required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }

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
