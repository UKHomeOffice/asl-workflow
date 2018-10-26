const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');
const { getNextSteps } = require('./flow');

const hooks = {
  meta: require('./hooks/meta'),
  create: require('./hooks/create'),
  resolve: require('./hooks/resolve')
};

module.exports = settings => {

  const app = Api(settings);

  const flow = Taskflow({ db: settings.taskflowDB });

  flow.hook('create', hooks.meta(settings));

  flow.hook('create', hooks.create(settings));

  flow.hook('pre-status:*:resolved', hooks.resolve(settings));

  flow.migrate();

  app.use(flow);

  app.get('/', (req, res, next) => {
    if (!req.query.status) {
      req.query.exclude = { status: 'autoresolved' };
    }

    next();

    if (res.body.data) {
      let tasks = res.body.data;
      console.log(tasks);

      tasks = tasks.map(task => {
        task.nextSteps = getNextSteps(task.data.model, task.status);
      });

      res.body.data = tasks;
    }
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
