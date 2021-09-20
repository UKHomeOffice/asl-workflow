const { mapValues } = require('lodash');

function mapTruish(val) {
  if (val === null || val === undefined) {
    return val;
  }
  const yeps = [
    'Yes',
    'yes',
    true,
    1
  ];
  return yeps.includes(val);
}

module.exports = settings => task => {
  if (task.data && (task.data.meta)) {
    const yeps = [
      'authority',
      'awerb',
      'ready',
      'awerb-exempt'
    ];

    const meta = mapValues(task.data.meta, (value, key) => {
      if (yeps.includes(key)) {
        return mapTruish(value);
      }
      return value;
    });

    return {
      ...task,
      data: {
        ...task.data,
        meta
      }
    };
  }
  return task;
};
