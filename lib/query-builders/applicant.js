const { returnedToApplicant } = require('../flow/status');

module.exports = {
  // subject = <my-profile-id> AND status = "returned-to-applicant"
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereJsonSupersetOf('data', { subject: profile.id })
      .andWhere('status', returnedToApplicant.id);
  },

  inProgress: (queryBuilder, profile) => {
    // todo
  },

  completed: (queryBuilder, profile) => {
    // todo
  }
};
