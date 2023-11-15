module.exports = licenceType => query => {
  switch (licenceType) {
    case 'pil':
      return query.whereJsonSupersetOf('data', { model: 'pil' });

    case 'pil-e':
    case 'trainingPil':
      return query.whereJsonSupersetOf('data', { model: 'trainingPil' });

    case 'ppl':
      return query.andWhere(builder => {
        builder.whereJsonSupersetOf('data', { model: 'project' });
        builder.orWhereJsonSupersetOf('data', { model: 'rop' });
      });

    case 'profile':
      return query.whereJsonSupersetOf('data', { model: 'profile' });

    case 'pel':
      return query.andWhere(builder => {
        builder.whereJsonSupersetOf('data', { model: 'establishment' });
        builder.orWhereJsonSupersetOf('data', { model: 'place' });
        builder.orWhereJsonSupersetOf('data', { model: 'role' });
      });
  }
};
