const { get } = require('lodash');
const { bankHolidays } = require('@asl/constants');
const moment = require('moment-business-time');

const STANDARD_DEADLINE = 40;
const EXTENDED_DEADLINE = 55;
const RESUBMISSION_DEADLINE = 20;

const AMENDMENT_DEADLINE = 20;
const AMENDMENT_RESUBMISSION_DEADLINE = 15;

// configure bank holidays
moment.updateLocale('en', { holidays: bankHolidays });

module.exports = () => {
  return task => {
    const model = get(task, 'data.model');
    const action = get(task, 'data.action');

    if (model !== 'project' || action !== 'grant') {
      return Promise.resolve();
    }

    let internalDeadline;

    const isAmendment = get(task, 'data.modelData.status') !== 'inactive';
    const resubmitted = task.activityLog.filter(a => /^status:.+:with-inspectorate$/.test(a.eventName)).length > 1;

    if (isAmendment) {
      const interval = resubmitted ? AMENDMENT_RESUBMISSION_DEADLINE : AMENDMENT_DEADLINE;
      internalDeadline = {
        standard: moment(task.updatedAt).addWorkingTime(interval, 'days').format('YYYY-MM-DD'),
        resubmitted
      };
    } else {
      if (resubmitted) {
        internalDeadline = {
          standard: moment(task.updatedAt).addWorkingTime(RESUBMISSION_DEADLINE, 'days').format('YYYY-MM-DD'),
          resubmitted: true
        };
      } else {
        internalDeadline = {
          standard: moment(task.updatedAt).addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD'),
          extended: moment(task.updatedAt).addWorkingTime(EXTENDED_DEADLINE, 'days').format('YYYY-MM-DD')
        };
      }
    }

    if (internalDeadline) {
      return task.patch({ internalDeadline });
    }

    return Promise.resolve();
  };
};
