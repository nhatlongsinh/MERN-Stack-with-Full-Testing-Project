const bcrypt = require('bcryptjs');
const passport = require('passport');
const debug = require('debug')('server:passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const UserModel = require('../models/UserModel');
const { mapUserModelToUserState, generateHashPassword } = require('../common/ultils');

// register
passport.use(
  'register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await UserModel.findOne({ email: username }).exec();
        debug(user);

        if (user) {
          debug('email already taken');
          return done(null, false, { code: 409, message: 'email already taken' });
        }
        // create hash
        const hashPW = await generateHashPassword(password);

        // save
        debug('register: done');
        return done(null, { username, password: hashPW });
      } catch (error) {
        return done(error);
      }
    },
  ),
);

// login
passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    },
    async (username, password, done) => {
      try {
        const user = await UserModel.findOne({ email: username }).exec();
        debug(user);
        if (!user) {
          return done(null, false, { code: 404, message: 'email not found' });
        }
        const matched = await bcrypt.compare(password, user.password);
        if (!matched) {
          return done(null, false, { code: 401, message: 'Unauthorized' });
        }
        return done(null, mapUserModelToUserState(user));
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.use(
  'jwt',
  new JWTstrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (jwt, done) => {
      try {
        const user = await UserModel.findById(jwt.id);
        if (user) {
          done(null, mapUserModelToUserState(user));
        } else {
          done(null, false, { code: 401, message: 'Unauthorized' });
        }
      } catch (error) {
        done(error);
      }
    },
  ),
);
