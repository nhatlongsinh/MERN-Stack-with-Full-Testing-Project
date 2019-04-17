/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const ItemModel = require('../models/ItemModel');
const db = require('./mockDB');
const { getItems, addItem, deleteItem } = require('../controllers/ItemController');
// Unit Test - using mock db
describe('Item Controller', () => {
  // before All
  let toBeDeletedId;
  beforeAll(async () => {
    // mock db
    db();
    // add testing data
    const newItem = new ItemModel({
      name: 'Test Item - To be deleted',
    });
    const savedItem = await newItem.save();
    toBeDeletedId = savedItem.id;
  });
  it('should add new item & return item', async (done) => {
    // arrange
    const sample = {
      name: 'My Testing Item',
    };
    const req = {
      body: sample,
    };
    const json = jest.fn();
    const status = jest.fn();
    const res = {
      status,
      json,
    };

    // run
    await addItem(req, res);

    // assert
    // The mock function is called one
    expect(status.mock.calls.length).toBe(1);
    expect(json.mock.calls.length).toBe(1);
    // The first argument of the first call
    expect(status.mock.calls[0][0]).toBe(201);
    expect(json.mock.calls[0][0]).toEqual(expect.objectContaining(sample));

    done();
  });
  it('should delete item & return id', async (done) => {
    // arrange
    const id = toBeDeletedId;
    const req = {
      params: {
        id,
      },
    };
    const json = jest.fn();
    const status = jest.fn();
    const res = {
      status,
      json,
    };

    // run test
    await deleteItem(req, res);

    // assert
    // db delete
    const deletedItem = await ItemModel.findById(id);
    expect(deletedItem).toBeNull();
    // The mock function is called one
    expect(status.mock.calls.length).toBe(1);
    expect(json.mock.calls.length).toBe(1);
    // The first argument of the first call
    expect(status.mock.calls[0][0]).toBe(200);
    expect(json.mock.calls[0][0]._id).toEqual(id);

    done();
  });
  it('should get list items', async (done) => {
    const json = jest.fn();
    const req = {};
    const res = {
      json,
    };

    // run
    await getItems(req, res);

    // assert
    expect(json.mock.calls.length).toBe(1);
    // The first argument of the first call
    expect(Array.isArray(json.mock.calls[0][0])).toBe(true);

    done();
  });
});
