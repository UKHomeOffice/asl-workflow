const { withInspectorate, withLicensing } = require('../flow/status');

module.exports = settings => {
  return c => {
    if (!c.activityLog) {
      return c;
    }

    const submittedToAsru = !!c.activityLog.find(log => {
      return log.status === withInspectorate.id || log.status === withLicensing.id;
    });

    return {
      ...c,
      submittedToAsru
    };
  };
};
