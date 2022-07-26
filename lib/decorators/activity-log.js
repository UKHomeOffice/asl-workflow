const { get, set } = require('lodash');
const Cacheable = require('./cacheable');

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

function isDeadlineChange(item) {
  const isRemoved = 'event.meta.payload.meta.isRemoved';
  const isReinstated = 'event.meta.payload.meta.isReinstated';
  return get(item, isRemoved, false) || get(item, isReinstated, false);
}

function filterEvents(item) {
  const type = item.eventName.split(':').shift();
  return ['status', 'assign'].includes(type) || isDeadlineExtension(item) || isDeadlineChange(item);
}

module.exports = settings => {

  const { Profile } = settings.models;
  const cache = Cacheable();

  return task => {
    if (!task.activityLog) {
      return task;
    }

    const changedBys = Promise.all(task.activityLog.map(log => cache.query(Profile, log.changedBy)));
    const assignedTos = Promise.all(task.activityLog
      .filter(log => get(log, 'event.meta.assignedTo'))
      .map(log => cache.query(Profile, log.event.meta.assignedTo))
    );

    return Promise.all([changedBys, assignedTos])
      .then(([logChangedBys, logAssignedTos]) => {
        let activityLog = task.activityLog.filter(filterEvents);

        activityLog = activityLog.reduceRight((store, item, index) => {
          const itemStatus = getItemStatus(item);
          const statusChange = getStatusChange(item);
          const prev = store.length && store[store.length - 1];
          const wasResubmitted = get(item, 'event.meta.previous') === 'resubmitted';

          const isTransientChange = (statusChange && statusChange !== itemStatus) || wasResubmitted;

          const shouldSquash = prev &&
            ((item.event.req && item.event.req === prev.event.req) || isTransientChange);

          if (shouldSquash) {
            if (itemStatus !== 'assign') {
              store[store.length - 1].status = itemStatus;
            }
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
          log.assignedTo = logAssignedTos.find(profile => profile && profile.id === log.event.meta.assignedTo);
          set(log, 'event.meta.user.access_token', undefined);
          return log;
          // sort by createdAt descending
        }).sort((a, b) => b.createdAt > a.createdAt ? 1 : -1);

        return {
          ...task,
          activityLog
        };
      })
      .then(async task => {
        // some closed ppl licence holder tasks don't show the _before_ state correctly because modelData
        // was not fully populated at the time of submission.
        const modelData = get(task, 'activityLog[0].event.data.modelData', {});
        if (!task.isOpen && modelData.licenceHolderId && !modelData.licenceHolder) {
          modelData.licenceHolder = await cache.query(Profile, modelData.licenceHolderId);
        }
        return task;
      });

  };

};
