const {
  referredToInspector,
  withLicensing,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [referredToInspector.id]);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      withLicensing.id,
      inspectorRecommended.id,
      inspectorRejected.id,
      returnedToApplicant.id
    ]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }
};
