const {
  withLicensing,
  inspectorRecommended,
  inspectorRejected
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [withLicensing.id, inspectorRecommended.id, inspectorRejected.id]);
  },

  inProgress: (queryBuilder, profile) => {
    // todo
  },

  completed: (queryBuilder, profile) => {
    // todo
  }
};
