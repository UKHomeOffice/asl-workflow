const uuid = require('uuid/v4');

module.exports = {
  pil: {
    grant: uuid(),
    applied: uuid(),
    rejected: uuid(),
    transfer: uuid()
  },
  place: {
    applied: uuid(),
    resolved: uuid()
  },
  project: {
    grant: uuid()
  }
};
