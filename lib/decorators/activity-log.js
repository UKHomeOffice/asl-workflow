const Cacheable = require('./cacheable');

module.exports = settings => {

  const { Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    if (!c.activityLog) {
      return c;
    }

    const promises = c.activityLog.map(log => cache.query(Profile, log.changedBy));

    return Promise.all(promises)
      .then(logChangedBys => {
        const activityLog = c.activityLog.map(log => {
          log.changedBy = logChangedBys.find(profile => profile && profile.id === log.changedBy) || {};
          delete log.event.meta.user.access_token;
          return log;
        });

        return {
          ...c,
          activityLog
        };
      });

  };

};
