const db = require('@asl/schema');
const { uniq } = require('lodash');
const flow = require('../flow');

module.exports = settings => async (req, res, next) => {
  let cases = req.cases;

  const { Establishment } = db(settings.db);
  const establishmentIds = uniq(cases.map(taskCase => taskCase.data.establishmentId).filter(Boolean));
  const establishments = await Establishment.query().findByIds(establishmentIds);

  const { Profile } = db(settings.db);
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
