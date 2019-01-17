const {
  referredToInspector
} = require('../flow/status');

module.exports = {
  outstanding: (queryBuilder, profile) => {
    queryBuilder.whereIn('status', [referredToInspector.id]);
  },

  inProgress: (queryBuilder, profile) => {
    // todo
  },

  completed: (queryBuilder, profile) => {
    // todo
  }
};
