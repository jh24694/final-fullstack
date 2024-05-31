// routes.js
import express from 'express';
import * as ctrl from '../controllers/mainController.js';
import * as auth from '../controllers/authController.js';
import path from 'path';

const router = express.Router();

const imagesFolderPath = path.join(process.cwd(), 'public', 'images');

// Authentication routes
router.get('/login', auth.login);
router.post('/login', auth.verifyLogin);
router.get('/register', auth.register);
router.post('/register', auth.verifyRegister);
router.get('/logout', auth.logout);

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Protect the home route
router.get('/', isAuthenticated, async (req, res) => {
  try {
    await ctrl.home(req, res, imagesFolderPath);
  } catch (error) {
    console.error('Error rendering home page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Route to update the current monster index
router.post('/updateCurrentMonster', isAuthenticated, ctrl.updateCurrentMonster);

// Route to update the health of a specific monster
router.post('/updateMonsterHealth', isAuthenticated, ctrl.updateMonsterHealth);

export default router;
