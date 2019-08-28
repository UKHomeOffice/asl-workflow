const { get, set } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');

const updateModel = (model) => {
  const payload = get(model, 'meta.payload', {});
  const updates = get(model, 'data');

  if (payload.data) {
    set(updates, 'data', { ...updates.data, ...payload.data });
  }

  if (payload.meta) {
    set(updates, 'meta', { ...updates.meta, ...payload.meta });
  }

  return model.patch(updates);
};

module.exports = settings => {
  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'place':
      case 'establishment':
      case 'pil':
        return updateModel(model);
    }

    throw new BadRequestError();
  };
};
