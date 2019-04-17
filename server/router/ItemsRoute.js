const express = require('express');
const passport = require('passport');
const { errorHandlingMiddleware } = require('./errorHandlingMiddleware');
const {
  validateAddItem, addItem, getItems, deleteItem,
} = require('../controllers/ItemController');

const route = express.Router();

// @route   GET api/items
// @des     Get Items
// @access  Protected
route.get('/', passport.authenticate('jwt', { session: false }), errorHandlingMiddleware(getItems));

// @route   POST api/items
// @des     Post an Item
// @access  Protected
route.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  validateAddItem,
  errorHandlingMiddleware(addItem),
);

// @route   DELETE api/items
// @des     Delete an Item
// @access  Protected
route.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  errorHandlingMiddleware(deleteItem),
);

module.exports = route;
