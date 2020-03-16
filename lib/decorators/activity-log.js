const { get } = require('lodash');
const Cacheable = require('./cacheable');
const { autoResolved } = require('../flow/status');

function getItemStatus(item) {
  return item.eventName.split(':').pop();
}

function getStatusChange(item) {
  return get(item, 'event.meta.payload.status');
}

function isDeadlineExtension(item) {
  return !!get(item, 'event.meta.payload.data.extended');
}

function filterStatusChanges(item) {
  const [type, , status] = item.eventName.split(':');
  return (type === 'status' && status !== 'resubmitted') || isDeadlineExtension(item);
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
          const itemStatus = getItemStatus(item);
          const statusChange = getStatusChange(item);

          if (store.length && statusChange && statusChange !== itemStatus) {
            store[store.length - 1].status = itemStatus;
            return store;
          } else {
            return [
              ...store,
              {
                ...item,
                status: itemStatus,
                action: statusChange || itemStatus
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
