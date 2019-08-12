const { get } = require('lodash');
const moment = require('moment-business-time');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');

module.exports = settings => {
  return c => {
    if (get(c, 'data.model') !== 'project') {
      return c;
    }

    const isAmendment = get(c, 'data.modelData.status') === 'active';

    if (isAmendment) {
      return c;
    }

    return Promise.resolve()
      .then(() => Case.find(c.id))
      .then(model => {
        const lastSubmitted = model._activityLog.reduceRight((lastSubmission, activity) => {
          const status = activity.eventName.split(':').pop();
          return status === 'resubmitted' ? activity.createdAt : lastSubmission;
        }, c.createdAt);

        const period = c.data.extended ? 55 : 40;
        const deadline = moment(lastSubmitted).addWorkingTime(period, 'days');

        return {
          ...c,
          deadline
        };
      });
  };
};
