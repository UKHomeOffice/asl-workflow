module.exports = isAmendment => query => {
  isAmendment = !!(isAmendment === true || isAmendment === 'true');
  if (isAmendment) {
    return query.whereJsonSupersetOf('data', { modelData: { status: 'active' } });
  }

  return query.where(builder => {
    builder.whereJsonSupersetOf('data', { modelData: { status: 'inactive' } });
    builder.orWhereJsonSupersetOf('data', { modelData: { status: 'pending' } });
    builder.orWhereRaw(`data->'modelData'->>'status' IS NULL`);
  });
};
