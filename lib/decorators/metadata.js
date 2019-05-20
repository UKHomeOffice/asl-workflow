const Cacheable = require('./cacheable');

const ucFirst = text => {
  return `${text.charAt(0).toUpperCase()}${text.substring(1)}`;
};

module.exports = settings => {

  const { Establishment, Profile } = settings.models;
  const cache = Cacheable();

  return c => {
    const promises = [
      c.data.establishmentId && cache.query(Establishment, c.data.establishmentId),
      c.data.subject && cache.query(Profile, c.data.subject),
      c.data.changedBy && cache.query(Profile, c.data.changedBy)
    ];

    if (c.data.id && c.data.model) {
      const modelName = c.data.model === 'pil' ? c.data.model.toUpperCase() : ucFirst(c.data.model);
      const model = settings.models[modelName];
      promises.push(cache.query(model, c.data.id));
    }

    return Promise.all(promises)
      .then(([establishment, subject, changedBy, modelData]) => {
        return {
          ...c,
          data: {
            ...c.data,
            establishment,
            subject,
            profile: subject,
            changedBy,
            modelData
          }
        };
      });

  };

};
