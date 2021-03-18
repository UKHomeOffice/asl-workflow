module.exports = settings => {
  const { Profile } = settings.models;
  return (req, res, next) => {

    // define access token as a non-enumerable property so it is accessible in code downstream
    // but is not enumerated in activity logs event data
    const token = req.user.access_token;
    Object.defineProperty(req.user, 'access_token', {
      enumerable: false,
      value: token
    });

    if (req.user.profile) {
      return next();
    }
    return Profile.query()
      .findOne({ userId: req.user.id })
      .withGraphFetched('[roles, establishments]')
      .then(profile => {
        if (profile && !profile.asruUser) {
          profile.asruLicensing = false;
          profile.asruInspector = false;
          profile.asruAdmin = false;
          profile.asruSupport = false;
          profile.asruRops = false;
        }
        req.user.profile = profile;
      })
      .then(() => next())
      .catch(next);

  };
};
