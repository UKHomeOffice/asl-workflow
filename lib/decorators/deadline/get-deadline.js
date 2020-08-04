const { bankHolidays } = require('@asl/constants');
const moment = require('moment-business-time');
const { withInspectorate } = require('../../flow/status');

// configure bank holidays
moment.updateLocale('en', { holidays: bankHolidays });

module.exports = task => {
  const lastSubmitted = task.activityLog.reduce((lastSubmission, activity) => {
    const status = activity.eventName.split(':').pop();
    if (status === withInspectorate.id && moment(lastSubmission).isBefore(activity.createdAt)) {
      return activity.createdAt;
    }
    return lastSubmission;
  }, task.createdAt);

  const period = task.data.extended ? 55 : 40;
  return moment(lastSubmitted).addWorkingTime(period, 'days');
};
