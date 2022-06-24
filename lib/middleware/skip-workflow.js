const { get, noop } = require('lodash');
const resolve = require('../hooks/resolve');

module.exports = settings => {
  const resolver = resolve(settings);
  return (req, res, next) => {
    const shouldSkipWorkflow = () => {
      const model = get(req.body, 'model');
      const action = get(req.body, 'action');
      const nopes = ['update', 'patch', 'updateConditions'];
      if (model === 'export') {
        return true;
      }
      if (model === 'projectVersion' && nopes.includes(action)) {
        return true;
      }
      if (model === 'retrospectiveAssessment' && action === 'patch') {
        return true;
      }
      if (model === 'profile' && action === 'updateLastLogin') {
        return true;
      }
      if (model === 'rop' && ['update', 'create'].includes(action)) {
        return true;
      }
      if (model === 'procedure' && ['update', 'create', 'delete'].includes(action)) {
        return true;
      }
      if (model === 'project' && action === 'create') {
        if (get(req.body, 'data.isLegacyStub', false)) {
          return false; // don't skip workflow for legacy stub creation
        }
        return true;
      }
      if (model === 'emailPreferences') {
        return true;
      }
      if (model === 'reminder') {
        return true;
      }
      return false;
    };
    if (shouldSkipWorkflow()) {
      return resolver({ data: req.body, update: noop, patch: noop })
        .then(result => {
          res.json({ data: { data: result } });
        })
        .catch(next);
    }
    next();
  };
};
