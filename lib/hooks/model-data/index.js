const { get } = require('lodash');

module.exports = settings => {
  const { Place, Establishment, Project, PIL, Profile, Role, TrainingPil } = settings.models;

  function constrainProfileParams(builder) {
    return builder.select('firstName', 'lastName', 'id');
  }

  function constrainProjectParams(builder) {
    return builder.select('title', 'licenceNumber');
  }

  function constrainEstablishmentParams(builder) {
    return builder.select('name');
  }

  async function getModelData(type, id) {
    switch (type) {
      case 'place':
        return Place.query().findById(id).joinRoles();
      case 'establishment':
        return Establishment.query().findById(id)
          .withGraphJoined('authorisations');
      case 'project':
        return Project.query().findById(id)
          .withGraphJoined('licenceHolder(constrainProfileParams)')
          .modifiers({ constrainProfileParams });
      case 'pil':
        return PIL.query().findById(id)
          .withGraphJoined('profile.trainingPils.trainingCourse.[establishment(constrainEstablishmentParams), project(constrainProjectParams)]')
          .modifiers({ constrainProjectParams, constrainEstablishmentParams });
      case 'profile':
        return Profile.query().findById(id);
      case 'role':
        return Role.query().findById(id);
      case 'trainingPil':
        return TrainingPil.query().findById(id)
          .withGraphFetched('[profile.[pil.establishment, trainingPils.trainingCourse.[establishment(constrainEstablishmentParams), project(constrainProjectParams)]], trainingCourse.[establishment(constrainEstablishmentParams), project(constrainProjectParams)]]')
          .modifiers({ constrainProjectParams, constrainEstablishmentParams });
    }
  }

  return async model => {
    const type = get(model, 'data.model');
    const id = get(model, 'data.id');
    const action = get(model, 'data.action');

    if (action === 'create') {
      return Promise.resolve();
    }

    const modelData = await getModelData(type, id);

    return model.patch({ modelData });
  };
};
