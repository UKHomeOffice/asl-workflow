const { autoResolved } = require('../flow/status');

const excludeAutoResolved = (req, res, next) => {
  if (!req.query.status) {
    req.query.exclude = { status: autoResolved };
  }
  next();
};

module.exports = excludeAutoResolved;
