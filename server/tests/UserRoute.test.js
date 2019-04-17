require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../server');
const UserModel = require('../models/UserModel');
const db = require('../common/db');
const mockUser = require('./mocks/user');
const {
  generateHashPassword,
  generateUserAccessToken,
  mapUserModelToUserState,
} = require('../common/ultils');

describe('UserRoute', () => {
  const ids = [];
  let existUser;
  let rawUser;
  beforeAll(async (done) => {
    db();
    rawUser = mockUser('_exist');
    const hashPW = await generateHashPassword(rawUser.password);
    const userModel = new UserModel({ ...rawUser, password: hashPW });
    existUser = await userModel.save();
    ids.push(existUser.id);
    done();
  });
  afterAll(async (done) => {
    const objectIds = ids.map(id => mongoose.Types.ObjectId(id));
    await UserModel.deleteMany({ _id: { $in: objectIds } });
    done();
  });
  it('should return register name validation error', async (done) => {
    // arrange
    const newUser = mockUser('new');
    newUser.name = '';

    // run
    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(400);
    expect(response.body.message.length > 0).toBe(true);
    done();
  });
  it('should return register email validation error', async (done) => {
    // arrange
    const newUser = mockUser('new');
    newUser.email = '';

    // run
    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(400);
    expect(response.body.message.length > 0).toBe(true);
    done();
  });
  it('should return register password validation error', async (done) => {
    // arrange
    const newUser = mockUser('new');
    newUser.password = '';

    // run
    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(400);
    expect(response.body.message.length > 0).toBe(true);
    done();
  });
  it('should register new user and return user state', async (done) => {
    // arrange
    const newUser = mockUser('new');

    // run
    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      user: expect.any(Object),
      token: expect.any(String),
    });
    expect(response.body.user).toHaveProperty('id');

    ids.push(response.body.user.id);
    done();
  });
  it('should return login email validation error', async (done) => {
    // arrange
    const newUser = {
      email: '',
      password: rawUser.password,
    };

    // run
    const response = await request(server)
      .post('/api/users/login')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(400);
    expect(response.body.message.length > 0).toBe(true);
    done();
  });
  it('should return login password validation error', async (done) => {
    // arrange
    const newUser = {
      email: rawUser.email,
      password: '',
    };

    // run
    const response = await request(server)
      .post('/api/users/login')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(400);
    expect(response.body.message.length > 0).toBe(true);
    done();
  });
  it('should login and return user state', async (done) => {
    // arrange
    const newUser = {
      email: rawUser.email,
      password: rawUser.password,
    };

    // run
    const response = await request(server)
      .post('/api/users/login')
      .send(newUser);

    // test
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      user: expect.any(Object),
      token: expect.any(String),
    });
    expect(response.body.user).toHaveProperty('id');
    done();
  });
  it('should return error for profile without token', async (done) => {
    // run
    const response = await request(server).get('/api/users/profile');

    // test
    expect(response.statusCode).toBe(401);
    done();
  });
  it('should login and access to profile', async (done) => {
    // arrange
    const token = generateUserAccessToken(mapUserModelToUserState(existUser));
    // run
    const response = await request(server)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    // test
    expect(response.statusCode).toBe(200);
    expect(response.body.email).toEqual(existUser.email);

    done();
  });
});
