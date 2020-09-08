const uuidv4 = require('uuid/v4');
const moment = require('moment');
const activity = require('../data/activity-log.json');

module.exports = {
  populate: knex => {
    let delay = 0;
    return Promise.all(activity.map(log => {
      if (log['case_id'] === '71bd42e1-7cd7-4d51-8d99-694bd4c14810') {
        // keep the dates current so that the deadline is in the future, keep log in correct order
        const aMonthAgo = moment().subtract(1, 'month').add(delay, 'seconds').toISOString();
        log.created_at = aMonthAgo;
        log.updated_at = aMonthAgo;
        delay++;
      }

      return knex('activity_log')
        .insert({
          id: uuidv4(),
          ...log
        });
    }));
  },
  delete: knex => knex('activity_log').del()
};
