const Cacheable = require('./cacheable');
const { get } = require('lodash');

module.exports = settings => {
  const { Profile } = settings.models;
  const cache = Cacheable();

  return task => {
    let licenceHolderId = get(task, 'data.data.licenceHolderId');

    if (!licenceHolderId) {
      return task;
    }

    return cache.query(Profile, licenceHolderId)
      .then(licenceHolder => {
        return {
          ...task,
          data: {
            ...task.data,
            licenceHolder
          }
        };
      });
  };
};
