const { get } = require('lodash');
const moment = require('moment-business-time');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { withASRU } = require('../flow');

const { withInspectorate } = require('../flow/status');

const hasActiveDeadline = c => {
  const model = get(c, 'data.model');
  const action = get(c, 'data.action');
  const status = get(c, 'status');
  const isAmendment = get(c, 'data.modelData.status') !== 'inactive';

  if (model !== 'project' || action !== 'grant' || !withASRU().includes(status) || isAmendment) {
    return false;
  }

  const { authority, awerb, ready } = get(c, 'data.meta');
  return declarationConfirmed(authority) && declarationConfirmed(awerb) && declarationConfirmed(ready);
};

// declarations can be 'Yes', 'No', or 'Not yet'
const declarationConfirmed = declaration => declaration && declaration.toLowerCase() === 'yes';

module.exports = settings => {
  return c => {
    if (!hasActiveDeadline(c)) {
      return Promise.resolve(c);
    }

    return Promise.resolve()
      .then(() => {
        if (!c.activityLog) {
          return Case.find(c.id)
            .then(model => model.toJSON());
        }
        return c;
      })
      .then(model => {
        const lastSubmitted = model.activityLog.reduce((lastSubmission, activity) => {
          const status = activity.eventName.split(':').pop();
          if (status === withInspectorate.id && moment(lastSubmission).isBefore(activity.createdAt)) {
            return activity.createdAt;
          }
          return lastSubmission;
        }, c.createdAt);

        const period = c.data.extended ? 55 : 40;
        const deadline = moment(lastSubmitted).addWorkingTime(period, 'days');
        const isExtendable = c.isOpen && !c.data.extended;

        return {
          ...c,
          deadline,
          isExtendable
        };
      });
  };
};
