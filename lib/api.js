const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');

const hooks = {
  validate: require('./hooks/validate'),
  create: require('./hooks/create'),
  resolve: require('./hooks/resolve')
};

module.exports = settings => {

  const app = Api(settings);

  const flow = Taskflow({ db: settings.taskflowDB });

  flow.hook('pre-create', hooks.validate(settings));

  flow.hook('create', hooks.create(settings));

  flow.hook('pre-status:*:resolved', hooks.resolve(settings));

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
