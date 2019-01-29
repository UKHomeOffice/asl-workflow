const Cacheable = require('./cacheable');
const getNextStepsForUser = require('../flow/get-next-steps-for-user');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();

  return (c, user) => {

    const promises = [
      c.data.establishmentId && cache.query(Establishment, c.data.establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy),
      getNextStepsForUser(c, user.profile)
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
