const Schema = require('@asl/schema');
const snakeCase = str => str.replace(/[A-Z]/g, s => `_${s.toLowerCase()}`);

module.exports = settings => {

  return {
    init: (populate, keepAlive) => {
      const schema = Schema(settings);

      const tableNames = Object.keys(schema)
        .filter(key => !!schema[key].tableName)
        .map(key => snakeCase(schema[key].tableName));

      return schema.knex.raw(`TRUNCATE TABLE ${tableNames.join(', ')} CASCADE;`)
        .then(() => populate && populate(schema))
        .then(() => !keepAlive && schema.destroy())
        .then(() => schema)
        .catch(err => {
          schema.destroy();
          throw err;
        });
    }
  };

};
