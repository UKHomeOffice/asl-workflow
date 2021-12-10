const { get } = require('lodash');
const { onlyRolesChanged } = require('../util');

module.exports = settings => task => {
  const model = get(task, 'data.model');
  if (model !== 'place') {
    return task;
  }
  return {
    ...task,
    onlyRolesChanged: onlyRolesChanged(task)
  };
};
