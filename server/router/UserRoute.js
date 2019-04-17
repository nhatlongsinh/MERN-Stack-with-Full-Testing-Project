const express = require('express');
const passport = require('passport');
const { errorHandlingMiddleware } = require('./errorHandlingMiddleware');
const {
  registerUser,
  validateRegisterUser,
  loginUser,
  validateloginUser,
} = require('../controllers/UserController');

const route = express.Router();
// @route   POST api/users/register
// @des     register
// @access  Public
route.post('/register', validateRegisterUser, errorHandlingMiddleware(registerUser));
// @route   POST api/users/login
// @des     login
// @access  Public
route.post('/login', validateloginUser, errorHandlingMiddleware(loginUser));
// @route   POST api/users/profile
// @des     profile
// @access  Protected
route.get('/profile', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json(req.user);
});

module.exports = route;
