const db = require('@asl/schema');
const { uniq } = require('lodash');

module.exports = settings => async (req, res, next) => {
  let cases = req.cases;

  console.log('in decorator middleware');
  console.log(res.respondWith);

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

    // add next steps based on case status

    return taskCase;
  });

  next();
};
