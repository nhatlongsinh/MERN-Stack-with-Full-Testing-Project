const { body } = require('express-validator/check');
const debug = require('debug')('server:ItemController');
const validationErrorHandler = require('./validationHandler');
const ItemModel = require('../models/ItemModel');

/**
 * @description get all items
 * @param req - Request.
 * @param res - Response.
 * @returns Response items array to client.
 */
const getItems = async (req, res) => {
  const items = await ItemModel.find();
  res.json(items);
};

/**
 * @description validator for add item
 */
const validateAddItem = [body('name', 'Item name is required').isLength({ min: 3 })];

/**
 * @description add new item
 * @param req - Request.
 * @param res - Response.
 * @returns Response saved item to client.
 */
const addItem = async (req, res) => {
  validationErrorHandler(req, res);
  const newItem = new ItemModel({
    name: req.body.name,
  });
  const savedItem = await newItem.save();
  debug(savedItem);
  res.status(201);
  res.json({
    name: savedItem.name,
    _id: savedItem.id,
  });
};

/**
 * @description delete an item
 * @param req - Request.
 * @param res - Response.
 * @returns Response deleted id or 404 to client.
 */
const deleteItem = async (req, res) => {
  validationErrorHandler(req, res);
  const item = await ItemModel.findById(req.params.id);
  if (item) {
    const result = await item.remove();
    debug(result);
    res.status(200);
    res.json({ _id: result.id });
  } else {
    // eslint-disable-next-line no-throw-literal
    throw { code: 404, message: '' };
  }
};

module.exports = {
  getItems,
  validateAddItem,
  addItem,
  deleteItem,
};
