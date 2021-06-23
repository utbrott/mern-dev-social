import { verify } from 'jsonwebtoken';
import { get } from 'config';

export default function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, auth denied.' });
  }

  try {
    const decoded = verify(token, get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token not valid' });
  }
}
