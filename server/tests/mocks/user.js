module.exports = postFix => ({
  name: `Mock User ${postFix}`,
  email: `mockUser${postFix}@mock.com`,
  password: 'mockpassword',
  passwordRe: 'mockpassword',
});
