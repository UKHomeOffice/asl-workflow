const {
  updated,
  resubmitted,
  withNtco,
  endorsed
} = require('../../flow/status');

module.exports = () => {
  return model => {

    switch (model.status) {

      case withNtco.id:
        return model.setStatus(endorsed.id);

      case updated.id:
        return model.setStatus(resubmitted.id);

      default:
        return Promise.resolve();

    }

  };
};
