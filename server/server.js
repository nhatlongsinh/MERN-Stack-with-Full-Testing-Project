require('dotenv').config();
const passport = require('passport');
const debug = require('debug')('server');
const express = require('express');
const db = require('./common/db');

const port = process.env.PORT || 8888;
// db
db();

const app = express();
// parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// passport
app.use(passport.initialize());
require('./common/passport');

// routes
app.use('/api/items', require('./router/ItemsRoute'));
app.use('/api/users', require('./router/UserRoute'));

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    debug(`Server started on ${port}`);
  });
}

module.exports = app;
