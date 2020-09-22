const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { awaitingEndorsement, withInspectorate } = require('../../flow/status');

module.exports = settings => {
  const { TrainingPil, PIL } = settings.models;

  return async model => {
    const action = get(model, 'data.action');
    const trainingPilId = get(model, 'data.id');
    const establishmentId = get(model, 'data.establishmentId');

    switch (action) {
      case 'grant':
        const trainingPil = await TrainingPil.query().findById(trainingPilId);
        const pil = await PIL.query().findOne({ profileId: trainingPil.profileId, status: 'active' });

        if (pil && pil.establishmentId !== establishmentId) {
          await model.patch({ establishmentId: pil.establishmentId });
          return model.setStatus(awaitingEndorsement.id);
        }

        return model.setStatus(withInspectorate.id);

      default:
        throw new BadRequestError('Unrecognised action');
    }
  };
};
