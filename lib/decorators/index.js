module.exports = settings => {

  const { Establishment, Profile } = settings.models;

  return c => {

    const promises = [
      c.data.establishmentId && Establishment.query().findById(c.data.establishmentId),
      c.data.subject && Profile.query().findById(c.data.subject),
      c.data.changedBy && Profile.query().findById(c.data.changedBy)
    ];

    return Promise.all(promises)
      .then(([establishment, subject, changedBy]) => {
        return {
          ...c,
          data: {
            ...c.data,
            establishment,
            subject,
            profile: subject,
            changedBy
          }
        };
      });

  };

};
