const { get, merge } = require('lodash');

const updateModel = (model) => {
  const payload = get(model, 'meta.payload', {});

  const data = get(model, 'data');
  const updates = {};

  if (payload.data) {
    updates.data = payload.data;
  }

  if (payload.meta) {
    updates.meta = payload.meta;
  }

  return model.patch(merge(data, updates));
};

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'place':
      case 'establishment':
      case 'pil':
      case 'profile':
      case 'role':
        return updateModel(model);
    }

    return Promise.resolve();
  };
};