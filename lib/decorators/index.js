const Cacheable = require('./cacheable');
const flow = require('../flow');
const { withdrawnByApplicant } = require('../flow/status');
const queryBuilder = require('../query-builders');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;

  const cache = Cacheable();

  const getNextSteps = (req, c) => {
    const profile = req.user.profile;

    // if the task is in progress for the current user, then they can withdraw it
    return queryBuilder({ profile, progress: 'inProgress' })
      .andWhere('cases.id', c.id)
      .then(cases => cases.results.length > 0)
      .then(canWithdrawTask => {
        if (canWithdrawTask) {
          return [withdrawnByApplicant];
        }

        // if the task is outstanding for the current user then they can action it
        return queryBuilder({ profile, progress: 'outstanding' })
          .andWhere('cases.id', c.id)
          .then(cases => cases.results.length > 0)
          .then(canActionTask => canActionTask ? flow.getNextSteps(c.status) : []);
      });
  };

  return (c, req) => {

    const promises = [
      c.data.establishmentId && cache.query(Establishment, c.data.establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy),
      getNextSteps(req, c)
    ];

    return Promise.all(promises)
      .then(([establishment, subject, changedBy, nextSteps]) => {
        return {
          ...c,
          data: {
            ...c.data,
            establishment,
            subject,
            profile: subject,
            changedBy
          },
          nextSteps
        };
      });

  };

};
