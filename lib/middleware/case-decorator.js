const { uniq } = require('lodash');
const flow = require('../flow');

module.exports = settings => async (req, res, next) => {
  const cases = req.cases;

  const { Establishment } = settings.models;
  const establishmentIds = uniq(cases.map(taskCase => taskCase.data.establishmentId).filter(Boolean));
  const establishments = await Establishment.query().findByIds(establishmentIds);

  const { Profile } = settings.models;
  const profileIds = uniq(cases.map(taskCase => taskCase.data.subject).filter(Boolean));
  const profiles = await Profile.query().findByIds(profileIds);

  req.cases = cases.map(taskCase => {
    if (taskCase.data.establishmentId) {
      taskCase.data.establishment = establishments.find(establishment => establishment.id === taskCase.data.establishmentId);
    }

    if (taskCase.data.subject) {
      taskCase.data.profile = profiles.find(profile => profile.id === taskCase.data.subject);
    }

    taskCase.nextSteps = flow.getNextSteps(taskCase.data.model, taskCase.status);

    return taskCase;
  });

  next();
};
