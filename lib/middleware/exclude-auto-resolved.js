const { autoResolved } = require('../flow/status');

const excludeAutoResolved = (req, res, next) => {
  if (!req.query.status) {
    req.query.exclude = { status: autoResolved.id };
  }
  next();
};

module.exports = excludeAutoResolved;
