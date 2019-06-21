const Cacheable = require('./cacheable');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    const establishmentId = c.data.establishmentId || (c.data.model === 'establishment' && c.data.id);
    const promises = [
      establishmentId && cache.query(Establishment, establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy)
    ];

    return Promise.all(promises)
      .then(([establishment, subject, changedBy, licenceHolder]) => {
        return {
          ...c,
          data: {
            ...c.data,
            establishment,
            subject,
            profile: subject,
            changedBy
          }
        };
      });

  };

};
