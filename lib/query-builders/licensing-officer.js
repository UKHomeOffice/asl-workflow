const {
  ntcoEndorsed,
  withLicensing,
  withInspectorate,
  inspectorRecommended,
  inspectorRejected,
  referredToInspector,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [ntcoEndorsed.id, withLicensing.id, inspectorRecommended.id, inspectorRejected.id]);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [referredToInspector.id, returnedToApplicant.id, withInspectorate.id]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }
};
