const cache = {};

const clean = () => {
  Object.keys(cache).forEach(key => {
    if (cache[key].expires < Date.now()) {
      delete cache[key];
    }
  });
};

setInterval(clean, 300000);

module.exports = (settings = {}) => {

  settings.ttl = settings.ttl || 300000;

  const query = (Model, id) => {
    const key = `${Model.tableName}:${id}`;
    if (cache[key] && cache[key].expires > Date.now()) {
      return Promise.resolve(cache[key].result);
    } else {
      return Model.queryWithDeleted().findById(id)
        .then(result => {
          cache[key] = {
            expires: Date.now() + settings.ttl,
            result
          };
          return result;
        });
    }
  };

  return { query };

};
