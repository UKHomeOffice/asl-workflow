module.exports = (Case, settings) => {

  const { Establishment, PIL, Project } = settings.models;

  return () => {
    const models = [Establishment, Project, PIL];
    const queries = models.map(model => {
      return model.query().count('*').where({ status: 'active' })
        .then(result => result[0].count);
    });
    return Promise.all(queries)
      .then(([ establishments, projects, pils ]) => ({ establishments, projects, pils }));
  };

};
