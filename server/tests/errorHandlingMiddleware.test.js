const { errorHandlingMiddleware } = require('../router/errorHandlingMiddleware');

describe('errorHandlingMiddleware', () => {
  it('should not return error', () => {
    // arrange
    const json = jest.fn();
    const errorFreeFunction = jest.fn();
    const middleware = errorHandlingMiddleware(errorFreeFunction);
    // run
    middleware({}, { json }, {});

    // expect
    // call function once
    expect(errorFreeFunction.mock.calls.length).toBe(1);
    // does not call res.json
    expect(json.mock.calls.length).toBe(0);
  });
  it('should return error', async () => {
    // arrange
    const errorObj = { code: 500, message: 'test error' };
    const json = jest.fn();
    const status = jest.fn();

    // run
    await errorHandlingMiddleware(async () => {
      throw errorObj;
    })({}, { json, status }, {});

    // expect
    // does not call res.json
    expect(status.mock.calls.length).toBe(1);
    expect(json.mock.calls.length).toBe(1);
    expect(status.mock.calls[0][0]).toBe(errorObj.code);
    expect(json.mock.calls[0][0].message).toEqual(errorObj.message);
  });
});
