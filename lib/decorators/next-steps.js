const getNextStepsForUser = require('../flow/get-next-steps-for-user');
const { resubmitted } = require('../flow/status');

module.exports = settings => {

  return (c, user) => {

    if (!user || !user.profile) {
      return c;
    }

    return getNextStepsForUser(c, user.profile)
      .then(nextSteps => {
        if (c.data.model === 'project' && c.data.action === 'grant') {
          nextSteps = nextSteps.filter(s => s.id !== resubmitted.id);
        }
        return {
          ...c,
          nextSteps
        };
      });

  };

};
