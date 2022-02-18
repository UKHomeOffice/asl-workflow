const moment = require('moment-business-time');
const { bankHolidays } = require('@asl/constants');
moment.updateLocale('en', { holidays: bankHolidays });

const STANDARD_DEADLINE = 40;
const EXTENDED_DEADLINE = 55;
const RESUBMISSION_DEADLINE = 20;

const projects = [
  {
    title: 'Internal deadline future',
    licenceNumber: 'INTDL-FUT',
    data: {
      internalDeadline: {
        standard: moment().addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD')
      }
    }
  },
  {
    title: 'Internal deadline urgent',
    licenceNumber: 'INTDL-URG',
    data: {
      internalDeadline: {
        standard: moment().addWorkingTime(5, 'days').format('YYYY-MM-DD')
      }
    }
  },
  {
    title: 'Internal deadline past',
    licenceNumber: 'INTDL-PAST',
    data: {
      internalDeadline: {
        standard: moment().subtractWorkingTime(2, 'days').format('YYYY-MM-DD')
      }
    }
  },
  {
    title: 'Internal deadline future, statutory deadline future (same date)',
    licenceNumber: 'INTDL-STAT-FUT',
    data: {
      internalDeadline: {
        standard: moment().addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD')
      },
      deadline: {
        standard: moment().addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD'),
        extended: moment().addWorkingTime(EXTENDED_DEADLINE, 'days').format('YYYY-MM-DD'),
        isExtended: false
      }
    }
  },
  {
    title: 'Internal deadline future, statutory deadline future (internal earlier)',
    licenceNumber: 'INTDL-EARLY-STAT',
    data: {
      internalDeadline: {
        standard: moment().addWorkingTime(RESUBMISSION_DEADLINE, 'days').format('YYYY-MM-DD')
      },
      deadline: {
        standard: moment().addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD'),
        extended: moment().addWorkingTime(EXTENDED_DEADLINE, 'days').format('YYYY-MM-DD'),
        isExtended: false
      }
    }
  },
  {
    title: 'Internal deadline past, statutory deadline future',
    licenceNumber: 'INTDL-PAST-STAT-FUT',
    data: {
      internalDeadline: {
        standard: moment().subtractWorkingTime(2, 'days').format('YYYY-MM-DD')
      },
      deadline: {
        standard: moment().addWorkingTime(STANDARD_DEADLINE, 'days').format('YYYY-MM-DD'),
        extended: moment().addWorkingTime(EXTENDED_DEADLINE, 'days').format('YYYY-MM-DD'),
        isExtended: false
      }
    }
  },
  {
    title: 'Internal deadline past, statutory deadline past',
    licenceNumber: 'INTDL-PAST-STAT-PAST',
    data: {
      internalDeadline: {
        standard: moment().subtractWorkingTime(2, 'days').format('YYYY-MM-DD')
      },
      deadline: {
        standard: moment().subtractWorkingTime(2, 'days').format('YYYY-MM-DD'),
        extended: moment().addWorkingTime(13, 'days').format('YYYY-MM-DD'),
        isExtended: false
      }
    }
  }
];

module.exports = async makeTask => {
  const meta = { authority: true, awerb: true, ready: true };
  return Promise.all(projects.map(opts => {
    // if we always include complete & correct meta we'll end up with statutory deadlines
    // auto-added where we're not expecting, so don't do that
    return opts.licenceNumber.includes('STAT')
      ? makeTask({ model: 'project', meta, ...opts })
      : makeTask({ model: 'project', ...opts });
  }));
};
