module.exports = action => query => {
  return query.whereJsonSupersetOf('data', { action });
};
