const {
  ntcoEndorsed,
  withLicensing,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  withInspectorate,
  referredToInspector
} = require('../flow/status');

module.exports = {
  myTasks: (queryBuilder, profile) => {
    queryBuilder.where(builder => {
      profile.asru
        .forEach(establishment => {
          builder.orWhereJsonSupersetOf('data', { establishmentId: establishment.id });
        });
    }).whereIn('status', [withInspectorate.id, referredToInspector.id]);
  },

  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      withInspectorate.id,
      referredToInspector.id
    ]);
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
