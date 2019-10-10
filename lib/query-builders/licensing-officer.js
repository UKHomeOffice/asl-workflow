const {
  ntcoEndorsed,
  adminEndorsed,
  withLicensing,
  withInspectorate,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  discardedByApplicant
} = require('../flow/status');

module.exports = {
  myTasks: (queryBuilder, profile) => {
    queryBuilder.where(builder => {
      profile.asru
        .forEach(establishment => {
          builder.orWhereJsonSupersetOf('data', { establishmentId: establishment.id });
        });
    })
      .whereIn('status', [
        ntcoEndorsed.id,
        withLicensing.id,
        inspectorRecommended.id,
        inspectorRejected.id
      ]);
  },

  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      ntcoEndorsed.id,
      withLicensing.id,
      inspectorRecommended.id,
      inspectorRejected.id
    ]);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      returnedToApplicant.id,
      withInspectorate.id,
      referredToInspector.id,
      adminEndorsed.id
    ]);
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      resolved.id,
      rejected.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id
    ]);
  }
};
