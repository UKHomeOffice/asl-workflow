module.exports = schemaVersion => query => {
  return query.whereJsonSupersetOf('data', { modelData: { schemaVersion: parseInt(schemaVersion, 10) } });
};
