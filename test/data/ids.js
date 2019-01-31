const uuid = require('uuid/v4');

module.exports = {
  pil: {
    applied: uuid(),
    rejected: uuid()
  },
  place: {
    applied: uuid(),
    resolved: uuid()
  }
};
