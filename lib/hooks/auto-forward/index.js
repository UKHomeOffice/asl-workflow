const {
  ntcoEndorsed,
  withLicensing,
  updated,
  resubmitted
} = require('../../flow/status');

module.exports = () => {
  return model => {

    switch (model.status) {

      // all tasks endorsed by NTCO go to licensing
      case ntcoEndorsed.id:
        return model.setStatus(withLicensing.id);
      case updated.id:
        return model.setStatus(resubmitted.id);

      default:
        return Promise.resolve();

    }

  };
};
