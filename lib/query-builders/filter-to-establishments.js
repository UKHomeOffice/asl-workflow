module.exports = establishments => builder => {
  builder
    .whereJsonSubsetOf('data:establishmentId', establishments)
    .orWhere(builder => {
      builder
        .whereJsonSupersetOf('data', { model: 'establishment' })
        .whereJsonSubsetOf('data:id', establishments);
    });
};
