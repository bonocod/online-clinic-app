const express = require('express');
const authMiddleware = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  createUser,
  getReportedPosts,
  deletePost,
  resolveReport
} = require('../controllers/adminController');

const router = express.Router();

router.use(authMiddleware, isAdmin);

router.post('/users', createUser);
router.get('/reported-posts', getReportedPosts);
router.delete('/posts/:id', deletePost);
router.patch('/posts/:id/resolve', resolveReport);

module.exports = router;