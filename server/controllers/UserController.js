const { body } = require('express-validator/check');
const debug = require('debug')('server:UserController');
const passport = require('passport');
const validationErrorHandler = require('./validationHandler');
const UserModel = require('../models/UserModel');
const { mapUserModelToUserState, generateUserAccessToken } = require('../common/ultils');

/**
 * @description genreate user state to send to client
 * @param user  - User Object.
 * @returns User state.
 */
const generateAuthorizedState = (user) => {
  const token = generateUserAccessToken(user);
  return { user, token };
};

/**
 * @description check user exist
 * @param email - Email.
 * @returns Boolean.
 */
const isUserExist = async (email) => {
  if (email && email.length > 1) {
    const user = await UserModel.findOne({ email });
    if (user) return true;
  }
  return false;
};
/**
 * @description validator for register user
 */
const validateRegisterUser = [
  body('name', 'Name must be at least 5 characters').isLength({ min: 8 }),
  body('password')
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be from 8 to 20 characters'),
  body('passwordRe').custom(async (value, { req }) => {
    if (value !== req.body.password) {
      await Promise.reject(new Error('Password confirmation does not match password'));
    }
  }),
  body('email')
    .isEmail()
    .withMessage('Email is invalid')
    .isLength({ min: 5 })
    .withMessage('Email must be at least 5 characters')
    .custom(async (value) => {
      if (await isUserExist(value)) {
        await Promise.reject(new Error('Email already registers.'));
      }
    }),
];

/**
 * @description register user
 * @param req - Request.
 * @param res - Response.
 * @param next  - Next.
 * @returns Response user to client.
 */
const registerUser = async (req, res, next) => {
  validationErrorHandler(req, res);
  passport.authenticate('register', async (err, userCredentials, info) => {
    try {
      if (info) {
        throw info;
      }
      if (err) {
        throw err;
      }
      const newUser = new UserModel({
        name: req.body.name,
        email: userCredentials.username,
        password: userCredentials.password,
      });
      // save
      const addedUser = await newUser.save();
      const user = mapUserModelToUserState(addedUser);
      const userState = generateAuthorizedState(user);
      debug(userState);
      res.status(201);
      res.json(userState);
    } catch (error) {
      const code = error.status || 500;
      res.status(code);
      res.send(error);
    }
  })(req, res, next);
};
/**
 * @description validator for login user
 */
const validateloginUser = [
  body('password')
    .isLength({ min: 8, max: 20 })
    .withMessage('Password must be from 8 to 20 characters'),
  body('email')
    .isEmail()
    .withMessage('Email is invalid')
    .isLength({ min: 5 }),
];

/**
 * @description login user
 * @param req - Request.
 * @param res - Response.
 * @param next  - Next.
 * @returns Response token to client.
 */
const loginUser = async (req, res, next) => {
  validationErrorHandler(req, res);
  // passport
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (info) {
        throw info;
      }
      if (err) {
        throw err;
      }
      const userState = generateAuthorizedState(user);
      debug(userState);
      res.status(200);
      res.json(userState);
    } catch (error) {
      const code = error.status || 500;
      res.status(code);
      res.send(error);
    }
  })(req, res, next);
};

module.exports = {
  validateRegisterUser,
  registerUser,
  loginUser,
  validateloginUser,
};
