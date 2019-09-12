const cache = {};

module.exports = (settings = {}) => {

  settings.ttl = settings.ttl || 300000;

  const query = (Model, id) => {
    const key = `${Model.tableName}:${id}`;
    if (cache[key] && cache[key].updated + settings.ttl > Date.now()) {
      return Promise.resolve(cache[key].result);
    } else {
      return Model.queryWithDeleted().findById(id)
        .then(result => {
          cache[key] = {
            updated: Date.now(),
            result
          };
          return result;
        });
    }
  };

  const clean = () => {
    Object.keys(cache).forEach(key => {
      if (cache[key].updated + settings.ttl < Date.now()) {
        delete cache[key];
      }
    });
  };

  setInterval(clean, 2 * settings.ttl);

  return { query };

};
