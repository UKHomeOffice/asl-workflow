module.exports = model => query => {
  switch (model) {
    case 'pil':
      return query.andWhere(builder => {
        builder.whereJsonSupersetOf('data', { model: 'pil' });
        builder.orWhereJsonSupersetOf('data', { model: 'trainingPil' });
      });

    default:
      return query.whereJsonSupersetOf('data', { model });
  }
};
