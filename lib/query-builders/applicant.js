const {
  autoResolved,
  returnedToApplicant,
  resolved,
  rejected,
  withdrawn
} = require('../flow/status');

module.exports = {
  // subject = <my-profile-id> AND status = "returned-to-applicant"
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .andWhere('status', returnedToApplicant.id);
  },

  // subject = <my-profile-id> AND status NOT IN ("autoresolved", "resolved", "rejected", "withdrawn", "returned-to-applicant")
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
