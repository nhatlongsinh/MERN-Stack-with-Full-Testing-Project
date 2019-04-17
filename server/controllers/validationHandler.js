const { validationResult } = require('express-validator/check');
const debug = require('debug')('server:validation');

/**
 * @description Handling express-validator errors
 * @param req - Request.
 * @param res - Response.
 * @returns throw errors if exist.
 */
// eslint-disable-next-line no-unused-vars
module.exports = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const arrErrors = errors.array();
    debug(arrErrors);
    // bad request
    const errorObj = {
      code: 400,
      message: arrErrors.map(e => e.msg).join('. '),
    };

    throw errorObj;
  }
};
