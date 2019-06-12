const addDefaultMetadata = require('./default');
const addPilMetadata = require('./pil');
const addProfileMetadata = require('./profile');

const ucFirst = text => {
  return `${text.charAt(0).toUpperCase()}${text.substring(1)}`;
};

module.exports = settings => {
  return async model => {
    const data = model.data || {};
    const type = data.model;
    const id = data.id;

    if (id) {
      const modelName = type === 'pil' ? type.toUpperCase() : ucFirst(type);
      const Model = settings.models[modelName];
      const modelData = await Model.query().findById(id);
      data.modelData = modelData;
    }

    switch (type) {
      case 'pil':
        return addPilMetadata(settings, model);

      case 'profile':
        return addProfileMetadata(settings, model);

      default:
        return addDefaultMetadata(settings, model);
    }
  };
};
