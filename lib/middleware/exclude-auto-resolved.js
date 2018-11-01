const excludeAutoResolved = (req, res, next) => {
  console.log('in exclude autoResolved middleware');

  if (!req.query.status) {
    req.query.exclude = { status: 'autoresolved' };
  }
  next();
};

module.exports = excludeAutoResolved;
