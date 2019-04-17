const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const { Mockgoose } = require('mockgoose');

const mockgoose = new Mockgoose(mongoose);
const debug = require('debug')('server:db');

module.exports = () => {
  mockgoose.prepareStorage().then(() => mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useCreateIndex: true })
    .then(() => {
      debug('Mock DB connected');
    })
    .catch((err) => {
      debug(`Mock DB cannot connect${err}`);
    }));
};
