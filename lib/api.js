const express = require('express');
const proxy = require('http-proxy-middleware');

module.exports = settings => {
  const app = express();

  app.use(proxy(settings.resolver, { secure: false }));

  return app;

};
