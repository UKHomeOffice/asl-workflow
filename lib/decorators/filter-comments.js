const { get, pickBy, flatten } = require('lodash');
const Cacheable = require('./cacheable');

module.exports = settings => {

  const { Profile } = settings.models;
  const cache = Cacheable();

  return (c, user) => {
    if (!c.activityLog) {
      return c;
    }

    let statusChanges = c.activityLog
      .filter(a => a.eventName.match(/^status:/))
      .sort((a, b) => {
        // sort into ascending order by time
        return a.createdAt < b.createdAt ? -1 : 1;
      });

    // if a correction to a status is found then remove that correction as well as the preceding and following status change.
    let recoveries = Object.keys(pickBy(statusChanges, a => a.eventName === 'status:rejected:recovered')).map(i => parseInt(i, 10));
    recoveries = flatten(recoveries.map(i => [ i - 1, i, i + 1 ]));

    if (recoveries.length) {
      statusChanges = statusChanges.filter((a, i) => !recoveries.includes(i));
    }

    const getLastEvent = fn => {
      return statusChanges.reduceRight((time, activity) => {
        if (time) {
          return time;
        }
        if (fn(activity)) {
          return activity.createdAt;
        }
      }, null);
    };

    const lastSubmit = getLastEvent(s => s.event.status === 'resubmitted') || c.createdAt;
    const lastASRUAction = getLastEvent(s => get(s, 'event.meta.user.profile.asruUser', false)) || c.createdAt;

    const isVisible = comment => {
      if (comment.eventName !== 'comment') {
        return false;
      }
      const timestamp = comment.createdAt;

      if (user.profile.asruUser === comment.event.meta.user.profile.asruUser) {
        return true;
      }

      if (user.profile.asruUser) {
        return timestamp < lastSubmit;
      } else {
        return timestamp < lastASRUAction;
      }

    };

    const isNew = comment => {
      return user.profile.asruUser ? comment.createdAt > lastASRUAction : comment.createdAt > lastSubmit;
    };

    const comments = c.activityLog
      .filter(activity => isVisible(activity))
      .map(activity => {
        return {
          ...activity,
          isNew: isNew(activity),
          isMine: user.profile.id === get(activity, 'event.meta.user.profile.id')
        };
      });

    const promises = comments.map(comment => cache.query(Profile, comment.changedBy));

    return Promise.all(promises)
      .then(commentAuthors => {
        return {
          ...c,
          comments: comments.map(comment => {
            comment.changedBy = commentAuthors.find(profile => profile && profile.id === comment.changedBy) || {};
            delete comment.event.meta.user.access_token;
            return comment;
          })
        };
      });

  };

};
