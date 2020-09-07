const { get } = require('lodash');
const moment = require('moment-business-time');
const { bankHolidays } = require('@asl/constants');
const { withInspectorate } = require('../../flow/status');

const STANDARD_DEADLINE = 40;
const EXTENDED_DEADLINE = 55;

// configure bank holidays
moment.updateLocale('en', { holidays: bankHolidays });

module.exports = task => {
  let deadline = get(task, 'data.deadline');

  if (!deadline || !deadline.standard) {
    const lastSubmitted = task.activityLog.reduce((lastSubmission, activity) => {
      const status = activity.eventName.split(':').pop();
      if (status === withInspectorate.id && moment(lastSubmission).isBefore(activity.createdAt)) {
        return activity.createdAt;
      }
      return lastSubmission;
    }, task.createdAt);

    const isExtended = deadline.isExtended || get(task, 'data.extended', false); // old location of extended flag for BC

    deadline = {
      standard: moment(lastSubmitted).addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD'),
      extended: moment(lastSubmitted).addWorkingTime(EXTENDED_DEADLINE, 'days').format('YYYY-MM-DD'),
      isExtended,
      isExtendable: task.isOpen && !isExtended
    };
  } else {
    deadline.isExtendable = task.isOpen && !deadline.isExtended;
  }

  return deadline;
};
