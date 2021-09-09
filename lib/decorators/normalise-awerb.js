const { mapValues } = require('lodash');

function destupidify(value) {
  if (value === null || value === undefined) {
    return value;
  }
  const yeps = [
    true,
    'yes',
    'Yes'
  ];
  return yeps.includes(value);
}

function cleanAwerb(meta) {
  const yeps = [
    'awerb',
    'awerb-exempt',
    'ready',
    'authority'
  ];
  return mapValues(meta, (val, key) => {
    if (yeps.includes(key)) {
      return destupidify(val);
    }
    return val;
  });
}

module.exports = settings => task => {
  if (task.data) {
    return {
      ...task,
      data: {
        ...task.data,
        meta: cleanAwerb(task.data.meta)
      }
    };
  }
  return task;
};
