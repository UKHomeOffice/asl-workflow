const {
  endorsed,
  withLicensing,
  inspectorRecommended,
  inspectorRejected,
  returnedToApplicant,
  sentToApplicant,
  representationMade,
  resolved,
  rejected,
  refused,
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
    endorsed.id,
    representationMade.id
  ]);
};

const isConditionRepresentations = builder => profile => {
  builder
    .whereJsonSupersetOf('data:changedBy', {id: profile.id})
    .whereIn('status', ['representation-made']);
};

module.exports = {
  myTasks: (queryBuilder, profile) => {
    queryBuilder
      .where(myTasks(profile))
      .andWhere(isOutstandingQuery);
    isConditionRepresentations(queryBuilder, profile);
  },

  outstanding: (queryBuilder, profile) => {
    isOutstandingQuery(queryBuilder);
    isConditionRepresentations(queryBuilder, profile);
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
      }).orWhere(builder => {
        builder.where('status', sentToApplicant.id)
          .whereJsonNotSupersetOf('data', {changedBy: profile.id});
      });
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
