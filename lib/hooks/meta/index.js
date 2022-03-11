const addDefaultMetadata = require('./default');
const addPilMetadata = require('./pil');
const addProfileMetadata = require('./profile');
const addProjectMetadata = require('./project');
const addRopMetadata = require('./rop');

module.exports = settings => {
  const { Profile } = settings.models;

  return async model => {
    const data = model.data || {};
    const type = data.model;
    const changedBy = data.changedBy;
    const nopes = ['asruEstablishment', 'feeWaiver'];

    if (changedBy) {
      const profile = await Profile.query().findById(changedBy);
      await model.patch({ initiatedByAsru: !!profile.asruUser });
    }

    if (nopes.includes(type)) {
      return Promise.resolve();
    }

    switch (type) {
      case 'pil':
        return addPilMetadata(settings, model);

      case 'project':
        return addProjectMetadata(settings, model);

      case 'profile':
        return addProfileMetadata(settings, model);

      case 'rop':
        return addRopMetadata(settings, model);

      default:
        return addDefaultMetadata(settings, model);
    }

  };
};
