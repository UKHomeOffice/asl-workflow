const excludeAutoResolved = (req, res, next) => {
  if (!req.query.status) {
    req.query.exclude = { status: 'autoresolved' };
  }
  next();
};

module.exports = excludeAutoResolved;
