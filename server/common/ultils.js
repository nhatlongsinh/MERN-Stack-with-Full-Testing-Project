const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports.mapUserModelToUserState = user => ({
  name: user.name,
  email: user.email,
  id: user.id,
});

// eslint-disable-next-line max-len
module.exports.generateUserAccessToken = user => jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

module.exports.generateHashPassword = async (password) => {
  // create salt & hash
  // eslint-disable-next-line radix
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_LENGTH));
  const hashPW = await bcrypt.hash(password, salt);
  return hashPW;
};
