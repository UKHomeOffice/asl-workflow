const uuidv4 = require('uuid/v4');
const activity = require('../data/activity-log.json');

module.exports = {
  populate: knex => {
    return Promise.all(activity.map(log => {
      return knex('activity_log')
        .insert({
          id: uuidv4(),
          ...log
        });
    }));
  },
  delete: knex => knex('activity_log').del()
};
