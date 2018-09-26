const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');
const Queue = require('./queue');

module.exports = settings => {

  const app = Api(settings);
  const queue = Queue(settings.sqs);

  const flow = Taskflow({
    db: settings.db
  });

  flow.hook('create', model => {
    return model.setStatus('resolved');
  });

  flow.hook('status:*:resolved', model => {
    return queue(model.data);
  });

  flow.migrate();

  app.use(flow);

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
