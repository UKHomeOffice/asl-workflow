const { get } = require('lodash');
const db = require('@asl/schema');

module.exports = (settings, model) => {
  const { PIL } = db(settings.db);
  const action = get(model, 'data.action');
  const data = get(model, 'data');

  if (action === 'create') {
    data.subject = get(data, 'data.profileId'); // pil holder
    data.establishmentId = get(data, 'data.establishmentId');
    return model.update(data);
  }

  const pilId = get(data, 'id');
  console.log('pilId: ', pilId);

  return Promise.resolve()
    .then(() => PIL.query().findById(pilId))
    .then(pil => {
      console.log('pil: ', pil);
      data.subject = pil.profileId; // pil holder
      data.establishmentId = pil.establishmentId;
    })
    .then(() => model.update(data));
};
