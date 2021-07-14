const {
  updated,
  resubmitted,
  withNtco,
  endorsed,
  recovered,
  withInspectorate
} = require('../../flow/status');

module.exports = () => {
  return model => {

    switch (model.status) {

      case withNtco.id:
        return model.setStatus(endorsed.id);

      case updated.id:
        return model.setStatus(resubmitted.id);

      case recovered.id:
        return model.setStatus(withInspectorate.id);

      default:
        return Promise.resolve();

    }

  };
};
