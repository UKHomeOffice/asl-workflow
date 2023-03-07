const {
  withLicensing,
  withInspectorate,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  sentToApplicant,
  resolved,
  rejected,
  refused,
  withdrawnByApplicant,
  discardedByApplicant,
  discardedByAsru
} = require('../flow/status');

module.exports = {

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      withLicensing.id,
      withInspectorate.id,
      referredToInspector.id,
      inspectorRecommended.id,
      inspectorRejected.id,
      returnedToApplicant.id,
      sentToApplicant
    ]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      resolved.id,
      rejected.id,
      refused.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id,
      discardedByAsru.id
    ]);
  }

};
