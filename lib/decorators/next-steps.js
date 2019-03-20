const getNextStepsForUser = require('../flow/get-next-steps-for-user');

module.exports = settings => {

  return (c, user) => {

    if (!user || !user.profile) {
      return c;
    }

    return getNextStepsForUser(c, user.profile)
      .then(nextSteps => {
        return {
          ...c,
          nextSteps
        };
      });

  };

};
