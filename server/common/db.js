const mongoose = require('mongoose');
const debug = require('debug')('server:db');

module.exports = () => mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useCreateIndex: true })
  .then(() => {
    debug('DB connected');
  })
  .catch((err) => {
    debug(`DB cannot connect${err}`);
  });
