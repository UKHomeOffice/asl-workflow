exports.seed = knex => {
  return knex('cases').del();
};
