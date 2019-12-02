const { get } = require('lodash');

const updateModel = (model) => {
  const payload = get(model, 'meta.payload', {});

  const data = get(model, 'data');
  const updates = { ...data };

  if (payload.data) {
    updates.data = Object.assign({}, data.data, payload.data);
  }

  if (payload.meta) {
    updates.meta = Object.assign({}, data.meta, payload.meta);
  }

  return model.patch(updates);
};

const updateProject = model => {
  const action = get(model, 'data.action');
  // only need to update model data if task is to transfer PPL holder
  if (action === 'update') {
    return updateModel(model);
  }
  return Promise.resolve();
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
      case 'project':
        return updateProject(model);
    }

    return Promise.resolve();
  };
};
