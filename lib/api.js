const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');

const hooks = {
  meta: require('./hooks/meta'),
  create: require('./hooks/create'),
  resolve: require('./hooks/resolve')
};

const excludeAutoResolved = (req, res, next) => {
  if (!req.query.status) {
    req.query.exclude = { status: 'autoresolved' };
  }
};

module.exports = settings => {

  const app = Api(settings);

  const flow = Taskflow({ db: settings.taskflowDB });

  flow.hook('create', hooks.meta(settings));

  flow.hook('create', hooks.create(settings));

  flow.hook('pre-status:*:resolved', hooks.resolve(settings));

  flow.migrate();

  app.get('/', excludeAutoResolved);

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
