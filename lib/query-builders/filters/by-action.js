module.exports = action => query => {
  if (action === 'change-licence-holder') {
    return query.andWhere(builder => {
      builder.whereJsonSupersetOf('data', { action: 'update' });
      builder.whereRaw(`data->'modelData'->>'licenceHolderId' != data->'data'->>'licenceHolderId'`);
    });
  }
  return query.whereJsonSupersetOf('data', { action });
};
