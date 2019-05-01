const Cacheable = require('./cacheable');

module.exports = settings => {

  const { Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    if (!c.activityLog) {
      return c;
    }

    const deletedComments = c.activityLog.filter(log => log.eventName === 'delete-comment').map(log => log.event.meta.id);

    deletedComments.forEach(id => {
      c.activityLog.find(log => log.id === id).deleted = true;
    });

    const promises = c.activityLog.map(log => cache.query(Profile, log.changedBy));

    return Promise.all(promises)
      .then(logChangedBys => {
        const activityLog = c.activityLog.map(log => {
          log.changedBy = logChangedBys.find(profile => profile && profile.id === log.changedBy) || {};
          return log;
        });

        return {
          ...c,
          activityLog
        };
      });

  };

};
