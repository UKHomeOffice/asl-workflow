const Cacheable = require('./cacheable');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();

  return c => {

    const promises = [
      c.data.establishmentId && cache.query(Establishment, c.data.establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy)
    ];

    return Promise.all(promises)
      .then(([establishment, subject, changedBy]) => {
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
