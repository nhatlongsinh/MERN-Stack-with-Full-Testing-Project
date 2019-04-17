/**
 * @description handle errors for route
 * @param fn - Function need to handle error.
 * @returns Response error to client.
 */
module.exports.errorHandlingMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    res.status(err.code || 500);
    res.json({ message: err.message });
    next(err);
  });
};
