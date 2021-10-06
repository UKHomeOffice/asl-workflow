const { get, merge } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');
const { awaitingEndorsement, withInspectorate } = require('../../flow/status');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);

  return model => {
    const action = get(model, 'data.action');

    function submitDraft(model) {
      return messager({ ...model.data, action: 'submit-draft' });
    }

    function submitRADraft(model) {
      return messager({ ...model.data, action: 'submit-ra' });
    }

    function markEndorsed(model) {
      const data = merge(model.data, { meta: { authority: true } });
      return model.patch(data);
    }

    function updateStatus(model, status) {
      return model.setStatus(status);
    }

    function establishmentUpdated(model) {
      const taskEstablishment = get(model, 'data.establishmentId');
      const toEstablishment = get(model, 'data.data.establishmentId');
      return taskEstablishment === toEstablishment;
    }

    function submitEndorsement(model) {
      return Promise.resolve()
        .then(() => submitDraft(model))
        .then(() => markEndorsed(model))
        .then(() => updateStatus(model, withInspectorate.id));
    }

    function submitRAEndorsement(model) {
      return Promise.resolve()
        .then(() => submitRADraft(model))
        .then(() => updateStatus(model, withInspectorate.id));
    }

    function transfer(model) {
      const establishmentId = get(model, 'data.data.establishmentId');
      return model.patch({ ...model.data, establishmentId });
    }

    switch (action) {
      case 'grant':
        return submitEndorsement(model);
      case 'grant-ra':
        return submitRAEndorsement(model);
      case 'update':
        return Promise.resolve()
          .then(() => markEndorsed(model))
          .then(() => updateStatus(model, withInspectorate.id));
      case 'transfer':
        if (establishmentUpdated(model)) {
          return submitEndorsement(model);
        }
        return Promise.resolve()
          .then(() => transfer(model))
          .then(() => updateStatus(model, awaitingEndorsement.id));
      default:
        throw new BadRequestError('Unrecognised action');
    }
  };
};
