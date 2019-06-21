const Cacheable = require('./cacheable');
const { get } = require('lodash');

module.exports = settings => {
  const { Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    const licenceHolderId = get(c, 'data.data.licenceHolderId');
    if (!licenceHolderId) {
      return c;
    }

    return cache.query(Profile, licenceHolderId)
      .then(licenceHolder => {
        return {
          ...c,
          data: {
            ...c.data,
            licenceHolder
          }
        };
      });
  };
};
