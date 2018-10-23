const { get } = require('lodash');
const db = require('@asl/schema');

module.exports = settings => {
  const { Roles } = db(settings.db);

  return model => {
    const type = get(model, 'data.model');
    const data = get(model, 'data');

    switch (type) {
      case 'pil':
        data.subject = get(data, 'data.profileId'); // pil holder
        data.establishmentId = get(data, 'data.establishmentId');
        break;

      case 'place':
        return Promise.resolve()
          .then(() => Roles.query().findOne({ type: 'pelh', establishmentId: get(data, 'data.establishmentId') }))
          .then(role => {
            data.subject = role.profileId; // establishment licence holder
            data.establishmentId = get(data, 'data.establishmentId');
          })
          .then(() => model.update(data));

      case 'profile':
        data.subject = get(data, 'data.id'); // profile user
        break;

      // case 'project':
      //   data.subject = ''; // project licence holder
      //   data.establishmentId = get(data, 'data.establishmentId');
      //   break;

      case 'trainingModule':
        data.subject = get(data, 'data.profileId');
        break;
    }

    return model.update(data);
  };
};
