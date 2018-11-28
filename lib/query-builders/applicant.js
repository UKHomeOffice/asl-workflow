const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawn
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .andWhere('status', returnedToApplicant.id);
  },

  inProgress: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .andWhere(builder => {
        builder.whereNotIn('status', [autoResolved.id, resolved.id, rejected.id, withdrawn.id, returnedToApplicant.id]);
      });
  },

  completed: (queryBuilder, profile) => {
    // todo
  }
};
