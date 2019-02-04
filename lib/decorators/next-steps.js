const getNextStepsForUser = require('../flow/get-next-steps-for-user');

module.exports = settings => {

  return (c, user) => {

    return getNextStepsForUser(c, user.profile)
      .then(nextSteps => {
        return {
          ...c,
          nextSteps
        };
      });

  };

};
