const { get, pick, size } = require('lodash');

module.exports = (settings, model) => {
  const authorisations = ['authority', 'awerb', 'ready'];
  const meta = get(model, 'meta.payload.meta', {});
  const updates = pick(meta, authorisations);

  const version = get(model, 'meta.payload.meta.version', null);
  const data = get(model, 'data');

  if (size(updates)) {
    Object.assign(data.meta, updates);
  }
  if (version) {
    Object.assign(data.data, { version });
  }

  return model.update(data);
};
