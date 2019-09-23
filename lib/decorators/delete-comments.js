module.exports = settings => {

  return (c, user) => {
    if (!c.activityLog) {
      return c;
    }

    const deletedComments = c.activityLog.filter(log => log.eventName === 'delete-comment').map(log => log.event.meta.id);

    const activityLog = c.activityLog
      .map(activity => {
        if (activity.eventName === 'comment' && deletedComments.includes(activity.id)) {
          return {
            ...activity,
            deleted: true,
            comment: null
          };
        }
        return activity;
      })
      .filter(activity => {
        return activity.eventName !== 'delete-comment';
      });

    return {
      ...c,
      activityLog
    };

  };

};
