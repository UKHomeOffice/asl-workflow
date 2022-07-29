const { get } = require('lodash');
const isUUID = require('uuid-validate');

const taskToFlagModelTypeMappings = {
  'place': 'places',
  'role': 'roles',
  'establishment': 'details'
};

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
        const taskModelType = get(task, 'data.model');
        task.enforcementFlagModelType = taskToFlagModelTypeMappings[taskModelType] || taskModelType;

        builder.orWhere((builder) => {
          builder.where({ modelType: 'establishment', establishmentId });

          if (task.enforcementFlagModelType) {
            builder.andWhere(builder => builder.whereJsonSupersetOf('model_options', [task.enforcementFlagModelType]));
          }
        });
      }
    })
    .withGraphFetched('subject.enforcementCase');

  return {
    ...task,
    enforcementFlags
  };
};
