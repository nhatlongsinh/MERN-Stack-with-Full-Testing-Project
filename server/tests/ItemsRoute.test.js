/* eslint-disable no-underscore-dangle */
const request = require('supertest');
const mongoose = require('mongoose');
const debug = require('debug')('server:ItemsRoute');
const server = require('../server');
require('dotenv').config();
const ItemModel = require('../models/ItemModel');
const db = require('../common/db');
const UserModel = require('../models/UserModel');
const mockUser = require('./mocks/user');
const { generateUserAccessToken, mapUserModelToUserState } = require('../common/ultils');

// Integration Test - express controller mongoose
describe('Items route integration test', () => {
  let database;
  const idToBeDeleted = [];
  let userId;
  let token;
  // before All
  beforeAll(async () => {
    // db
    database = db();
    // add testing data
    const newItem = new ItemModel({
      name: 'Test Item - To be deleted',
    });
    const addedItem = await newItem.save();
    idToBeDeleted.push(addedItem.id);
    // add user
    const newUser = new UserModel(mockUser('_exist'));
    const addedUser = await newUser.save();
    userId = addedUser.id;
    token = generateUserAccessToken(mapUserModelToUserState(addedUser));
  });
  // after All
  afterAll(async () => {
    const objectIds = idToBeDeleted.map(id => mongoose.Types.ObjectId(id));
    await ItemModel.deleteMany({ _id: { $in: objectIds } });
    await UserModel.findByIdAndRemove(userId);
    database.disconnect();
  });
  it('should protect get', async () => {
    // run
    const response = await request(server)
      .post('/api/items/')
      .send({ name: '' });
    // assert
    expect(response.statusCode).toBe(401);
  });
  it('should protect post', async () => {
    // run
    const response = await request(server)
      .post('/api/items/')
      .send({ name: '' });
    // assert
    expect(response.statusCode).toBe(401);
  });
  it('should protect delete', async () => {
    // run
    const response = await request(server)
      .post('/api/items/')
      .send({ name: '' });
    // assert
    expect(response.statusCode).toBe(401);
  });
  it('should add item', async () => {
    // arrange
    const sample = {
      name: 'Test item - to be deleted',
    };
    // run
    const response = await request(server)
      .post('/api/items/')
      .send(sample)
      .set('Authorization', `Bearer ${token}`);
    // assert
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toEqual(sample.name);
    idToBeDeleted.push(response.body.id);
  });

  it('should show validation error: "Item name is required"', async () => {
    // run
    const response = await request(server)
      .post('/api/items/')
      .send({ name: '' })
      .set('Authorization', `Bearer ${token}`);
    // assert
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Item name is required');
  });
  it('should delete item', async () => {
    // arrange
    const id = idToBeDeleted[0];
    // run
    const response = await request(server)
      .delete(`/api/items/${id}`)
      .set('Authorization', `Bearer ${token}`);
    // assert
    expect(response.statusCode).toBe(200);
    debug(response.body);
    expect(response.body._id).toEqual(id);
  });
  it('should show item not found', async () => {
    // run
    const response = await request(server)
      .delete('/api/items/000000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    // assert
    expect(response.statusCode).toBe(404);
  });
  it('should show items', async () => {
    // run
    const response = await request(server)
      .get('/api/items')
      .set('Authorization', `Bearer ${token}`);
    // assert
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
