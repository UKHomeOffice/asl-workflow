const Api = require('@asl/service/api');
const Taskflow = require('@ukhomeoffice/taskflow');
const schema = require('@asl/schema');
const {
  resubmitted,
  autoResolved,
  resolved,
  returnedToApplicant,
  discardedByApplicant,
  recalledByApplicant,
  discardedByAsru,
  updated,
  endorsed
} = require('./flow/status');
const tasksRouter = require('./router/tasks');
const openTasksRouter = require('./router/open-tasks');
const relatedTasksRouter = require('./router/related-tasks');
const flowRouter = require('./router/flow');

const decorators = require('./decorators');

const profile = require('./middleware/profile');
const skipWorkflow = require('./middleware/skip-workflow');

const hooks = {
  unique: require('./hooks/create/unique'),
  updateData: require('./hooks/update-data'),
  clearDeadline: require('./hooks/clear-deadline'),
  meta: require('./hooks/meta'),
  modelData: require('./hooks/model-data'),
  create: require('./hooks/create'),
  resolve: require('./hooks/resolve'),
  validateStatus: require('./hooks/validate/status'),
  validatePayload: require('./hooks/validate/payload'),
  autoForward: require('./hooks/auto-forward'),
  notify: require('./hooks/notify'),
  search: require('./hooks/search'),
  editAndResubmit: require('./hooks/edit-and-resubmit'),
  submissionMeta: require('./hooks/submission-meta'),
  resolutionMeta: require('./hooks/resolution-meta'),
  discard: require('./hooks/discard'),
  recall: require('./hooks/recall'),
  endorsed: require('./hooks/endorsed'),
  updateAction: require('./hooks/update-action')
};

module.exports = settings => {
  const app = Api(settings);
  const models = schema(settings.db);
  settings.models = models;
  app.models = models;

  app.use('/flow', flowRouter(settings));

  app.use(profile(settings));

  app.use(skipWorkflow(settings));

  const flow = Taskflow({ db: settings.taskflowDB });
  app.flow = flow;

  flow.decorate(decorators.metadata(settings));
  flow.decorate(decorators.taskType);
  flow.decorate(decorators.deadline(settings));
  flow.decorate(decorators.continuation(settings));
  flow.decorate(decorators.normaliseTraining(settings), { list: false });
  flow.decorate(decorators.filterComments(settings), { list: false });
  flow.decorate(decorators.deleteComments(settings), { list: false });
  flow.decorate(decorators.activityLog(settings), { list: false });
  flow.decorate(decorators.nextSteps(settings), { list: false });
  flow.decorate(decorators.licenceHolder(settings), { list: false });
  flow.decorate(decorators.trainingPilMeta(flow, settings));

  flow.hook('pre-create', hooks.unique(settings));
  flow.hook('create', hooks.updateData(settings));
  flow.hook('create', hooks.meta(settings));
  flow.hook('create', hooks.modelData(settings));
  flow.hook('create', hooks.updateAction(settings));
  flow.hook('create', hooks.submissionMeta(settings));
  flow.hook('create', hooks.create(settings));
  flow.hook(`status:*:${resubmitted.id}`, hooks.updateAction(settings));
  flow.hook(`status:*:${resubmitted.id}`, hooks.submissionMeta(settings));
  flow.hook(`status:*:${resubmitted.id}`, hooks.create(settings));

  flow.hook(`status:*:${recalledByApplicant.id}`, hooks.clearDeadline(settings));
  flow.hook(`status:*:${returnedToApplicant.id}`, hooks.clearDeadline(settings));

  flow.hook(`pre-status:*:${updated.id}`, hooks.editAndResubmit(settings));

  flow.hook(`pre-status:*:${recalledByApplicant.id}`, hooks.recall(settings));
  flow.hook(`pre-status:*:${returnedToApplicant.id}`, hooks.recall(settings));

  flow.hook('status:*:*', hooks.autoForward(settings));
  flow.hook('status:*:*', hooks.notify(settings));
  flow.hook(`status:*:${endorsed.id}`, hooks.endorsed(settings));

  flow.hook('pre-status:*:*', hooks.updateData(settings));

  flow.hook('pre-status:*:*', hooks.validateStatus());
  flow.hook('pre-status:*:*', hooks.validatePayload());
  flow.hook(`pre-status:*:${resolved.id}`, hooks.resolve(settings));
  flow.hook(`status:*:${autoResolved.id}`, hooks.resolve(settings));
  flow.hook('comment', hooks.notify(settings));

  flow.hook(`status:*:${discardedByApplicant.id}`, hooks.discard(settings));
  flow.hook(`status:*:${discardedByAsru.id}`, hooks.discard(settings));

  flow.hook(`status:*:${resolved.id}`, hooks.search(settings));
  flow.hook(`status:*:${autoResolved.id}`, hooks.search(settings));

  flow.hook(`status:*:${resolved.id}`, hooks.resolutionMeta(settings));
  flow.hook(`status:*:${autoResolved.id}`, hooks.resolutionMeta(settings));

  app.use('/open-tasks', openTasksRouter(flow, settings));
  app.use('/related-tasks', relatedTasksRouter(flow, settings));
  app.use('/', tasksRouter(flow, settings));
  app.use(flow);

  app.use((err, req, res, json) => {
    err.status = err.status || 500;
    req.log('error', { ...err, message: err.message, stack: err.stack, status: err.status });
    res.status(err.status);
    res.json({
      message: err.message,
      stack: err.stack
    });
  });

  return app;
};
