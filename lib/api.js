const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');
const decorator = require('./middleware/case-decorator');
const excludeAutoResolved = require('./middleware/exclude-auto-resolved');
const schema = require('@asl/schema');

const hooks = {
  meta: require('./hooks/meta'),
  create: require('./hooks/create'),
  resolve: require('./hooks/resolve')
};

module.exports = settings => {
  const app = Api(settings);
  settings.models = schema(settings.db);

  const flow = Taskflow({
    db: settings.taskflowDB,
    middleware: {
      before: [excludeAutoResolved],
      after: [decorator(settings)]
    }
  });

  flow.hook('create', hooks.meta(settings));
  flow.hook('create', hooks.create(settings));
  flow.hook('status:*:resubmitted', hooks.create(settings));

  flow.hook('pre-status:*:autoresolved', hooks.resolve(settings));
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
