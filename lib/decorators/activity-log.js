const { get } = require('lodash');
const Cacheable = require('./cacheable');
const { autoResolved } = require('../flow/status');

function getItemStatus(item) {
  return item && item.eventName.split(':').pop();
}

function getStatusChange(item) {
  return get(item, 'event.meta.payload.status');
}

function isDeadlineExtension(item) {
  const extensionFlag = 'event.meta.payload.data.deadline.isExtended';
  const bcExtensionFlag = 'event.meta.payload.data.extended';
  return get(item, extensionFlag) || get(item, bcExtensionFlag, false);
}

function filterStatusChanges(item) {
  const type = item.eventName.split(':').shift();
  return type === 'status' || isDeadlineExtension(item);
}

module.exports = settings => {

  const { Profile } = settings.models;
  const cache = Cacheable();

  return task => {
    if (!task.activityLog) {
      return task;
    }
    if (task.status === autoResolved.id) {
      return {
        ...task,
        activityLog: null
      };
    }

    const promises = task.activityLog.map(log => cache.query(Profile, log.changedBy));

    return Promise.all(promises)
      .then(logChangedBys => {
        let activityLog = task.activityLog.filter(filterStatusChanges);

        activityLog = activityLog.reduceRight((store, item, index) => {
          const itemStatus = getItemStatus(item);
          const statusChange = getStatusChange(item);
          const prev = store.length && store[store.length - 1];
          const wasResubmitted = get(item, 'event.meta.previous') === 'resubmitted';

          const isTransientChange = (statusChange && statusChange !== itemStatus) || wasResubmitted;

          const shouldSquash = prev &&
            ((item.event.req && item.event.req === prev.event.req) || isTransientChange);

          if (shouldSquash) {
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
          // sort by createdAt descending
        }).sort((a, b) => b.createdAt > a.createdAt ? 1 : -1);

        return {
          ...task,
          activityLog
        };
      });

  };

};
