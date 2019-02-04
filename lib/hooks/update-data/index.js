const updatePlace = require('./place');
const { get } = require('lodash');

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'place':
        return updatePlace(settings, model);
    }

    return Promise.resolve();
  };
};
