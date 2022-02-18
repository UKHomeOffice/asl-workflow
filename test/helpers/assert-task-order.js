const assert = require('assert');

module.exports = (tasks, order, column = 'updatedAt') => {
  assert.ok(tasks.length > 1, 'more than one task was returned');

  let previousTask = null;

  tasks.forEach(task => {
    if (previousTask) {
      if (order === 'descending') {
        assert.ok(previousTask[column] >= task[column], 'tasks should be in descending date order');
      } else {
        assert.ok(previousTask[column] <= task[column], 'tasks should be in ascending date order');
      }
    }
    previousTask = task;
  });
};
