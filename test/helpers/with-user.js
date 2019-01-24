const express = require('express');
const { user } = require('../data/profiles');

const makeDummyUser = profile => (req, res, next) => {
  req.user = Object.assign({
    id: '9c95da14-ed4a-444a-9640-814b950f4a33',
    access_token: '12345',
    profile: user,
    get: key => profile[key],
    can: () => Promise.resolve({ json: {} }),
    allowedActions: () => Promise.resolve({})
  }, profile);
  next();
};

const WithUser = (app, profile) => {
  const wrapper = express();
  wrapper.use(makeDummyUser(profile));

  const staticRouter = express.Router();
  wrapper.use(staticRouter);
  wrapper.setUser = profile => staticRouter.use(makeDummyUser(profile));

  wrapper.use(app);
  wrapper.app = app;
  return wrapper;
};

module.exports = WithUser;
