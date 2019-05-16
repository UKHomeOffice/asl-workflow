module.exports = (settings = {}) => {

  settings.ttl = settings.ttl || 60000;

  const cache = {};

  const query = (Model, id) => {
    const key = `${Model.tableName}:${id}`;
    if (cache[key] && cache[key].updated + settings.ttl > Date.now()) {
      return cache[key].result;
    } else {
      const result = Model.query().findById(id);
      cache[key] = {
        updated: Date.now(),
        result
      };
      return result;
    }
  };

  const queryWithDeleted = (Model, id) => {
    const key = `${Model.tableName}:${id}:deleted`;
    if (cache[key] && cache[key].updated + settings.ttl > Date.now()) {
      return cache[key].result;
    } else {
      const result = Model.queryWithDeleted().findById(id);
      cache[key] = {
        updated: Date.now(),
        result
      };
      return result;
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

  return {
    query,
    queryWithDeleted
  };

};
