const { get, omit } = require('lodash');
const { open } = require('../flow');

module.exports = (flow, settings) => {
  const { Task } = flow;
  const { TrainingPil } = settings.models;

  return async task => {
    const id = task.data.id;
    const model = task.data.model;
    const action = task.data.action;

    if (model !== 'trainingPil' || action !== 'grant') {
      return task;
    }

    const trainingPil = await TrainingPil.query().findById(id).select('status');

    const revocationCount = await Task.query()
      .whereJsonSupersetOf('data', { id, action: 'revoke' })
      .whereIn('status', open())
      .count()
      .first();

    const openRevocation = !!parseInt(revocationCount.count, 10);

    // if subject isn't set, copy it from the modelData sans nested pils (avoids excessive data duplication)
    task.data.subject = task.data.subject || omit(get(task, 'data.modelData.profile'), 'trainingPils', 'pil');

    return {
      ...task,
      openRevocation,
      modelStatus: trainingPil && trainingPil.status
    };
  };

};
