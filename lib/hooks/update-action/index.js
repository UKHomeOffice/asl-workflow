const { get, pick } = require('lodash');
const { NotFoundError, BadRequestError } = require('@asl/service/errors');

module.exports = settings => {

  const { Project, ProjectVersion, Profile, Establishment } = settings.models;

  return async model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');
    const id = get(model, 'data.id');
    const data = get(model, 'data.data');

    if (type === 'project' && action === 'grant') {
      const project = await Project.query().findById(id);
      const version = await ProjectVersion.query().orderBy('createdAt', 'desc').findOne({ projectId: id });
      const transferToEstablishmentId = get(version, 'data.transferToEstablishment');

      // not a transfer - continue.
      if (!transferToEstablishmentId) {
        return Promise.resolve();
      }

      const transferToEstablishment = await Establishment.query().findById(transferToEstablishmentId);

      if (!transferToEstablishment) {
        throw new NotFoundError();
      }

      // not a transfer = continue.
      if (transferToEstablishment.id === project.establishmentId) {
        return Promise.resolve();
      }

      const licenceHolder = await Profile.query().findById(project.licenceHolderId).withGraphFetched('establishments');

      const licenceHolderEstablishments = licenceHolder.establishments.map(e => e.id);

      if (!licenceHolderEstablishments.includes(transferToEstablishment.id)) {
        throw new BadRequestError(`User is not associated with ${transferToEstablishment.name}`);
      }

      const transferFromEstablishment = await Establishment.query().findById(project.establishmentId);

      const meta = {
        establishment: {
          to: pick(transferToEstablishment, 'id', 'name'),
          from: pick(transferFromEstablishment, 'id', 'name')
        }
      };

      return model.patch({ action: 'transfer', data: { ...data, establishmentId: transferToEstablishmentId }, meta });
    }

    return Promise.resolve();
  };
};
