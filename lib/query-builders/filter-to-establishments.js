const filterToEstablishments = establishments => builder => {
  return builder
    .whereJsonSubsetOf('data:establishmentId', establishments)
    .orWhere(builder => {
      builder
        .whereJsonSupersetOf('data', { model: 'establishment' })
        .whereJsonSubsetOf('data:id', establishments);
    });
};

const isTrainingPilAtOtherEstablishment = establishments => builder => {
  return builder
    .whereJsonSupersetOf('data', { model: 'trainingPil' })
    .whereJsonSubsetOf('data:data.establishmentId', establishments);
};

module.exports = {
  filterToEstablishments,
  isTrainingPilAtOtherEstablishment
};
