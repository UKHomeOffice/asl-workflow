const { get } = require('lodash');
const db = require('@asl/schema');

// set the pil holder as the subject
module.exports = (settings, model) => {
  const { PIL } = db(settings.db);
  const action = get(model, 'data.action');
  const data = get(model, 'data');

  if (action === 'create') {
    data.subject = get(data, 'data.profileId');
    data.establishmentId = get(data, 'data.establishmentId');
    return model.update(data);
  }

  const pilId = get(data, 'id');

  return Promise.resolve()
    .then(() => PIL.query().findById(pilId))
    .then(pil => {
      data.subject = pil.profileId;
      data.establishmentId = pil.establishmentId;
    })
    .then(() => model.update(data));
};
