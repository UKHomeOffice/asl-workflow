const {
  ntcoEndorsed,
  withLicensing
} = require('../../flow/status');

module.exports = () => {
  return model => {

    switch (model.status) {

      // all tasks endorsed by NTCO go to licensing
      case ntcoEndorsed.id:
        return model.setStatus(withLicensing.id);

      default:
        return Promise.resolve();

    }

  };
};
