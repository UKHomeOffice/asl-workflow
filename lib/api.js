const Api = require('@asl/service/api');
const Queue = require('./queue');

module.exports = settings => {

  const app = Api(settings);
  const queue = Queue(settings.sqs);

  app.post('/', (req, res, next) => {
    queue(req.body)
      .then(response => {
        res.json(response);
      })
      .catch(next);
  });

  app.use((err, req, res, json) => {
    err.status = err.status || 500;
    req.log('error', err);
    res.status(err.status);
    res.json({
      message: err.message,
      stack: err.stack
    });
  });

  return app;

};
