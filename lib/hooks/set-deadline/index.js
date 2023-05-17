const { get } = require('lodash');
const { bankHolidays } = require('@ukhomeoffice/asl-constants');
const moment = require('moment-business-time');
const completeAndCorrect = require('../../decorators/deadline/complete-and-correct');

const STANDARD_DEADLINE = 40;
const EXTENDED_DEADLINE = 55;

// configure bank holidays
moment.updateLocale('en', { holidays: bankHolidays });

module.exports = () => {
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');
    const isAmendment = get(model, 'data.modelData.status') !== 'inactive';

    if (type === 'project' && action === 'grant' && !isAmendment && completeAndCorrect(model.data.meta)) {
      const deadline = {
        standard: moment(model.updatedAt).addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD'),
        extended: moment(model.updatedAt).addWorkingTime(EXTENDED_DEADLINE, 'days').format('YYYY-MM-DD'),
        isExtended: false,
        isExtendable: true
      };

      return model.patch({ deadline });
    }

    return Promise.resolve();
  };
};
