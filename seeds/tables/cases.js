const uuidv4 = require('uuid/v4');
const moment = require('moment');
const cases = require('../data/cases.json');

module.exports = {
  populate: knex => {
    return Promise.all(cases.map(c => {
      if (c.id === '71bd42e1-7cd7-4d51-8d99-694bd4c14810') {
        // keep the dates current so that the deadline is in the future
        c.created_at = moment().subtract(1, 'month').toISOString();
        c.updated_at = moment().subtract(1, 'month').toISOString();
      }

      return knex('cases')
        .insert({
          id: uuidv4(),
          ...c
        });
    }));
  },
  delete: knex => knex('cases').del()
};
