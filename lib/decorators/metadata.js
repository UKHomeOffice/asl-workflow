const Cacheable = require('./cacheable');
const { closed } = require('../flow');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();
  const closedStatuses = closed();

  return c => {
    const establishmentId = c.data.establishmentId || (c.data.model === 'establishment' && c.data.id);
    const promises = [
      establishmentId && cache.query(Establishment, establishmentId),
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
          },
          isOpen: !closedStatuses.includes(c.status)
        };
      });

  };

};
