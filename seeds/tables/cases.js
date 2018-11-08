const uuidv4 = require('uuid/v4');
const cases = require('../data/cases.json');

module.exports = {
  populate: knex => {
    return Promise.all(cases.map(c => {
      return knex('cases')
        .insert({
          id: uuidv4(),
          ...c
        });
    }));
  },
  delete: knex => knex('cases').del()
};
