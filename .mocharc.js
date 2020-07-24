module.exports = {
  forbidOnly: !!process.env.CI,
  exit: true,
  recursive: true,
  timeout: 10000,
  require: 'dotenv/config'
};
