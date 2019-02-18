const Cacheable = require('./cacheable');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();

  return c => {

    const promises = [
      c.data.establishmentId && cache.query(Establishment, c.data.establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy),
      c.activityLog && Promise.all(c.activityLog.map(log => cache.query(Profile, log.changedBy)))
    ];

    return Promise.all(promises)
      .then(([establishment, subject, changedBy, logChangedBys]) => {
        let activityLog = [];

        activityLog = c.activityLog && c.activityLog.map(log => {
          log.changedBy = logChangedBys.find(profile => profile && profile.id === log.changedBy) || {};
          return log;
        });

        return {
          ...c,
          data: {
            ...c.data,
            establishment,
            subject,
            profile: subject,
            changedBy
          },
          activityLog
        };
      });

  };

};
