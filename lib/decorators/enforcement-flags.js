const { get } = require('lodash');
const isUUID = require('uuid-validate');

module.exports = settings => async (task, user) => {
  if (!get(user, 'profile.asruUser')) {
    return task;
  }

  const subject = get(task, 'data.subject');
  const modelData = get(task, 'data.modelData');
  const establishmentId = get(task, 'data.establishmentId');

  const { EnforcementFlag } = settings.models;

  const enforcementFlags = await EnforcementFlag.query()
    .where(builder => {
      if (subject && isUUID(subject.id)) {
        builder.orWhere({ modelId: subject.id });
      }

      if (modelData && isUUID(modelData.id)) {
        builder.orWhere({ modelId: modelData.id });
      }

      if (establishmentId) {
        builder.orWhere({ modelType: 'establishment', establishmentId });
      }
    })
    .withGraphFetched('subject.enforcementCase');

  return {
    ...task,
    enforcementFlags
  };
};
