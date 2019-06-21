const Cacheable = require('./cacheable');
const { get } = require('lodash');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    const establishmentId = c.data.establishmentId || (c.data.model === 'establishment' && c.data.id);
    const licenceHolderId = get(c, 'data.data.licenceHolderId');
    const promises = [
      establishmentId && cache.query(Establishment, establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy),
      licenceHolderId && cache.query(Profile, licenceHolderId)
    ];

    return Promise.all(promises)
      .then(([establishment, subject, changedBy, licenceHolder]) => {
        return {
          ...c,
          data: {
            ...c.data,
            licenceHolder,
            establishment,
            subject,
            profile: subject,
            changedBy
          }
        };
      });

  };

};
