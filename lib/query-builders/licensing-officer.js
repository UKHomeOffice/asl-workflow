const {
  ntcoEndorsed,
  withLicensing,
  withInspectorate,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
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
    queryBuilder.whereIn('status', [returnedToApplicant.id, withInspectorate.id, referredToInspector.id]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }
};
