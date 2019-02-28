const { get } = require('lodash');
const updatePlace = require('./place');
const updateProject = require('./project');

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'place':
        return updatePlace(settings, model);

      case 'project':
        return updateProject(settings, model);
    }

    return Promise.resolve();
  };
};
