const {
  endorsed,
  withLicensing,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawnByApplicant,
  withInspectorate,
  referredToInspector,
  discardedByApplicant,
  discardedByAsru
} = require('../flow/status');
const { myTasks } = require('./filters');

const isOutstandingQuery = builder => {
  builder.whereIn('status', [
    withInspectorate.id,
    referredToInspector.id,
    endorsed.id
  ]);
};

module.exports = {
  myTasks: (queryBuilder, profile) => {
    queryBuilder
      .where(myTasks(profile))
      .andWhere(isOutstandingQuery);
  },

  outstanding: (queryBuilder, profile) => {
    isOutstandingQuery(queryBuilder);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder
      .whereIn('status', [
        endorsed.id,
        withLicensing.id,
        inspectorRecommended.id,
        inspectorRejected.id
      ])
      .orWhere(builder => {
        builder.where('status', returnedToApplicant.id)
          .whereJsonNotSupersetOf('data', { changedBy: profile.id });
      });
  },

  completed: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [
      resolved.id,
      rejected.id,
      withdrawnByApplicant.id,
      discardedByApplicant.id,
      discardedByAsru.id
    ]);
  }
};
