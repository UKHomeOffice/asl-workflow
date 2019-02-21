const {
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

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      withLicensing.id,
      withInspectorate.id,
      referredToInspector.id,
      inspectorRecommended.id,
      inspectorRejected.id,
      returnedToApplicant.id
    ]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [resolved.id, rejected.id, withdrawnByApplicant.id]);
  }

};
