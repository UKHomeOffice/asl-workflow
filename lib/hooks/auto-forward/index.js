const {
  ntcoEndorsed,
  withLicensing,
  withInspectorate,
  referredToInspector
} = require('../../flow/status');

module.exports = () => {
  return model => {

    switch (model.status) {
      case referredToInspector.id:
        return model.setStatus(withInspectorate.id);

      // all tasks endorsed by NTCO go to licensing
      case ntcoEndorsed.id:
        return model.setStatus(withLicensing.id);

      default:
        return Promise.resolve();

    }

  };
};
