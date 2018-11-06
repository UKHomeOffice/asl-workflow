const { get } = require('lodash');

// set the establishment licence holder (PELH) as the subject
module.exports = (settings, model) => {
  const { Place, Role } = settings.models;
  const action = get(model, 'data.action');
  const data = get(model, 'data');

  if (action === 'create') {
    data.establishmentId = get(data, 'data.establishmentId');

    return Promise.resolve()
      .then(() => Role.query().findOne({ type: 'pelh', establishmentId: data.establishmentId }))
      .then(role => {
        data.subject = role.profileId;
      })
      .then(() => model.update(data));
  }

  const placeId = get(data, 'id');

  return Promise.resolve()
    .then(() => Place.query().findById(placeId))
    .then(place => {
      data.establishmentId = place.establishmentId;
    })
    .then(() => Role.query().findOne({ type: 'pelh', establishmentId: data.establishmentId }))
    .then(role => {
      data.subject = role.profileId;
    })
    .then(() => model.update(data));
};
