module.exports = establishments => builder => {
  return builder
    .whereJsonSubsetOf('data:establishmentId', establishments)
    .orWhere(builder => {
      builder
        .whereJsonSupersetOf('data', { model: 'establishment' })
        .whereJsonSubsetOf('data:id', establishments);
    });
};
