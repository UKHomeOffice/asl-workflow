const { get, merge } = require('lodash');

const {
  withLicensing,
  withInspectorate
} = require('../../flow/status');

const Messager = require('../../messager');

module.exports = settings => {

  const messager = Messager(settings);

  return model => {
    const type = get(model, 'data.model');

    switch (type) {
      case 'pil':
        return model.setStatus(withLicensing.id);
      case 'project':
        return Promise.resolve()
          .then(() => {
            messager({ ...model.data, action: 'submit-draft' })
          })
          .then(() => {
            const data = merge(model.data, { meta: { authority: 'yes' } });
            return model.patch(data);
          })
          .then(() => model.setStatus(withInspectorate.id));
      default:
        return model.setStatus(withInspectorate.id);
    }
  };
};
