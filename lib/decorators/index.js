const flow = require('../flow');

module.exports = settings => {

  const { Establishment, Profile } = settings.models;

  return c => {

    const promises = [
      c.data.establishmentId && Establishment.query().findById(c.data.establishmentId),
      c.data.subject && Profile.query().findById(c.data.subject),
      c.data.changedBy && Profile.query().findById(c.data.changedBy),
      Promise.resolve(flow.getNextSteps(c.status))
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
