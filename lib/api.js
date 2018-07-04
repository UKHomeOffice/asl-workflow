const api = require('@asl/service/api');

module.exports = settings => {
  const app = api(settings);

  app.use((req, res) => {
    console.log(req.body);
    res.json({ message: 'Hello world' });
  });

  return app;

};
