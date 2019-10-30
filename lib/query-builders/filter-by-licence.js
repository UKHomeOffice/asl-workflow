module.exports = licenceType => query => {
  switch (licenceType) {
    case 'pil':
      query.whereJsonSupersetOf('data', { model: 'pil' });
      break;

    case 'ppl':
      query.whereJsonSupersetOf('data', { model: 'project' });
      break;

    case 'profile':
      query.whereJsonSupersetOf('data', { model: 'profile' });
      break;

    case 'pel':
      query.andWhere(builder => {
        builder.whereJsonSupersetOf('data', { model: 'establishment' });
        builder.orWhereJsonSupersetOf('data', { model: 'place' });
        builder.orWhereJsonSupersetOf('data', { model: 'role' });
      });
      break;
  }
};
