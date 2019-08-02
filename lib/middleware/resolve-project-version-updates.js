const { get, noop } = require('lodash');
const resolve = require('../hooks/resolve');

module.exports = settings => {
  const resolver = resolve(settings);
  return (req, res, next) => {
    const model = get(req.body, 'model');
    const action = get(req.body, 'action');
    if (model === 'projectVersion' && (action === 'update' || action === 'patch')) {
      return resolver({ data: req.body, update: noop, patch: noop })
        .then(() => res.json({}))
        .catch(next);
    }
    next();
  };
};
