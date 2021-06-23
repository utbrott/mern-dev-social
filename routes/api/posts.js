import { Router } from 'express';
const router = Router();

// route:   GET api/posts
// desc:    Test route
// access:  Public
router.get('/', (req, res) => res.send('Posts route'));

export default router;
