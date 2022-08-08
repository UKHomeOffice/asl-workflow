const {
  endorsed,
  withLicensing,
  withInspectorate,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  resolved,
  rejected,
  refused,
  withdrawnByApplicant,
  discardedByApplicant,
  discardedByAsru
} = require('../flow/status');

const { myTasks } = require('./filters');

const isOutstandingQuery = builder => {
  builder.whereIn('status', [
    endorsed.id,
    withLicensing.id,
    inspectorRecommended.id,
    inspectorRejected.id
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
    queryBuilder.whereIn('status', [
      returnedToApplicant.id,
      withInspectorate.id,
      referredToInspector.id,
      endorsed.id
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
