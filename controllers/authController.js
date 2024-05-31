import User from '../models/user.js';
import passport from 'passport';
import fs from 'fs';
import path from 'path';

export const login = (req, res) => {
  res.render('login');
};

export const verifyLogin = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: false,
});

export const register = (req, res) => {
  res.render('register');
};

export const verifyRegister = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Load monster data from the JSON file
    const monsterDataPath = path.join(process.cwd(), 'monsters.json');
    const rawMonsterData = fs.readFileSync(monsterDataPath);
    const monsterData = JSON.parse(rawMonsterData);

    const user = new User({ username, password, monsters: monsterData });
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.send(error.message);
  }
};

export const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
};

// Middleware to check if the user is authenticated
export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};
