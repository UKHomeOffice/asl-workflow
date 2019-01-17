const { get } = require('lodash');
const addDefaultMetadata = require('./default');
const addPilMetadata = require('./pil');
const addPlaceMetadata = require('./place');
const addProfileMetadata = require('./profile');

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'pil':
        return addPilMetadata(settings, model);

      case 'place':
        return addPlaceMetadata(settings, model);

      case 'profile':
        return addProfileMetadata(settings, model);

      default:
        return addDefaultMetadata(settings, model);
    }
  };
};
