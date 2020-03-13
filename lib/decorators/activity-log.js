const moment = require('moment');
const Cacheable = require('./cacheable');
const { autoResolved } = require('../flow/status');

function getStatusFromEvent(event) {
  return event.split(':').pop();
}

function filterStatusChanges(item) {
  return item.eventName.split(':')[0] === 'status';
}

function isThenish(date, then) {
  return moment(date).isBetween(moment(then), moment(then).add(5, 'seconds'));
}

module.exports = settings => {

  const { Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    if (!c.activityLog) {
      return c;
    }
    if (c.status === autoResolved.id) {
      return {
        ...c,
        activityLog: null
      };
    }

    const promises = c.activityLog.map(log => cache.query(Profile, log.changedBy));

    return Promise.all(promises)
      .then(logChangedBys => {
        let activityLog = c.activityLog.filter(filterStatusChanges);

        activityLog = activityLog.reduceRight((store, item, index) => {
          if (store.length && isThenish(item.createdAt, store[store.length - 1].createdAt)) {
            store[store.length - 1].status = getStatusFromEvent(item.eventName);
            return store;
          } else {
            const status = getStatusFromEvent(item.eventName);
            return [
              ...store,
              {
                ...item,
                status,
                action: status
              }
            ];
          }
        }, []);

        activityLog = activityLog.map(log => {
          log.changedBy = logChangedBys.find(profile => profile && profile.id === log.changedBy) || {};
          delete log.event.meta.user.access_token;
          return log;
        }).reverse();

        return {
          ...c,
          activityLog
        };
      });

  };

};
