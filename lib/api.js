const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');
const decorator = require('./decorators');
const schema = require('@asl/schema');
const { resubmitted, autoResolved, resolved } = require('./flow/status');
const tasksRouter = require('./router/tasks');

const hooks = {
  meta: require('./hooks/meta'),
  create: require('./hooks/create'),
  resolve: require('./hooks/resolve'),
  validateStatus: require('./hooks/validate/status'),
  validatePayload: require('./hooks/validate/payload')
};

module.exports = settings => {
  const app = Api(settings);
  settings.models = schema(settings.db);

  const flow = Taskflow({ db: settings.taskflowDB });

  flow.decorate(decorator(settings));

  flow.hook('create', hooks.meta(settings));
  flow.hook('create', hooks.create(settings));

  flow.hook(`status:*:${resubmitted.id}`, hooks.create(settings));

  flow.hook(`pre-status:*:*`, hooks.validateStatus());
  flow.hook(`pre-status:*:*`, hooks.validatePayload());
  flow.hook(`pre-status:*:${autoResolved.id}`, hooks.resolve(settings));
  flow.hook(`pre-status:*:${resolved.id}`, hooks.resolve(settings));

  flow.migrate();

  app.use('/tasks', tasksRouter(settings, flow));
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
