const {
  ntcoEndorsed,
  withLicensing,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  withInspectorate
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [ withInspectorate.id ]);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      ntcoEndorsed.id,
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
