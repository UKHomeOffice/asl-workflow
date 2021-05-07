module.exports = profile => query => {
  query
    .where(builder => {
      builder
        .where(establishmentQuery => {
          profile.asru
            .forEach(establishment => {
              establishmentQuery.orWhereJsonSupersetOf('data', { establishmentId: establishment.id });
              establishmentQuery.orWhereJsonSupersetOf('data', { id: establishment.id, model: 'establishment' });
            });
        })
        .whereNull('assignedTo');
    })
    .orWhere('assignedTo', profile.id);
};
