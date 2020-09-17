const { open } = require('../flow');

module.exports = (flow, settings) => {
  const { Task } = flow;
  const { TrainingPil } = settings.models;

  return async c => {
    const id = c.data.id;
    const model = c.data.model;
    const action = c.data.action;

    if (model !== 'trainingPil' || action !== 'grant') {
      return c;
    }

    const trainingPil = await TrainingPil.query().findById(id).select('status');

    const revocationCount = await Task.query()
      .whereJsonSupersetOf('data', { id, action: 'revoke' })
      .whereIn('status', open())
      .count()
      .first();

    const openRevocation = !!parseInt(revocationCount.count, 10);

    return {
      ...c,
      openRevocation,
      modelStatus: trainingPil && trainingPil.status
    };
  };

};
