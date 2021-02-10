module.exports = initiatedBy => query => {
  if (initiatedBy === 'asru') {
    return query.whereJsonSupersetOf('data', { initiatedByAsru: true });
  }
  if (initiatedBy === 'external') {
    return query.andWhere(builder => {
      builder.whereJsonSupersetOf('data', { initiatedByAsru: false });
      builder.orWhereRaw(`data->>'initiatedByAsru' IS NULL`);
    });
  }
};
