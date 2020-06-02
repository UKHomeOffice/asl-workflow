const express = require('express');
const { user: basicUser } = require('../data/profiles');

const makeDummyUser = user => (req, res, next) => {
  req.user = Object.assign({
    id: '9c95da14-ed4a-444a-9640-814b950f4a33',
    access_token: '12345',
    profile: basicUser,
    get: key => user[key],
    can: () => Promise.resolve({ json: {} }),
    allowedActions: () => Promise.resolve({})
  }, user);

  next();
};

const WithUser = (app, user) => {
  const wrapper = express();
  wrapper.use(makeDummyUser(user));

  const staticRouter = express.Router();
  wrapper.use(staticRouter);
  wrapper.setUser = user => staticRouter.use(makeDummyUser(user));

  wrapper.use(app);
  wrapper.app = app;
  return wrapper;
};

module.exports = WithUser;
