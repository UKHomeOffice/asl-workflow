const { uniq } = require('lodash');
const flow = require('../flow');

module.exports = settings => async (req, res, next) => {
  let cases = req.case ? [req.case] : req.cases;

  const { Establishment } = settings.models;
  const establishmentIds = uniq(cases.map(taskCase => taskCase.data.establishmentId).filter(Boolean));
  const establishments = await Establishment.query().findByIds(establishmentIds);

  const { Profile } = settings.models;
  const profileIds = cases.map(taskCase => taskCase.data.subject).filter(Boolean);
  profileIds.concat(cases.map(taskCase => taskCase.data.changedBy).filter(Boolean));
  const profiles = await Profile.query().findByIds(uniq(profileIds));

  cases = cases.map(taskCase => {
    if (taskCase.data.establishmentId) {
      taskCase.data.establishment = establishments.find(establishment => establishment.id === taskCase.data.establishmentId);
    }

    if (taskCase.data.subject) {
      taskCase.data.subject = profiles.find(profile => profile.id === taskCase.data.subject);
    }

    if (taskCase.data.changedBy) {
      taskCase.data.changedBy = profiles.find(profile => profile.id === taskCase.data.changedBy);
    }

    taskCase.nextSteps = flow.getNextSteps(taskCase.status);

    return taskCase;
  });

  if (req.case) {
    req.case = cases[0];
  } else {
    req.cases = cases;
  }

  next();
};
