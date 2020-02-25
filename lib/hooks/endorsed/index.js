const { get, merge } = require('lodash');

const {
  withLicensing,
  withInspectorate
} = require('../../flow/status');

const Messager = require('../../messager');

module.exports = settings => {

  const messager = settings.StubMessager ? settings.StubMessager : Messager(settings);

  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    function transfer() {
      const establishmentId = get(model, 'data.data.establishment.to.id');
      return model.patch({ ...model.data, establishmentId });
    }

    switch (type) {
      case 'pil':
        return model.setStatus(withLicensing.id);
      case 'project':
        return Promise.resolve()
          .then(() => {
            return messager({ ...model.data, action: 'submit-draft' });
          })
          .then(() => {
            const data = merge(model.data, { meta: { authority: 'Yes' } });
            return model.patch(data);
          })
          .then(() => action === 'transfer' && transfer())
          .then(() => model.setStatus(withInspectorate.id));
      default:
        return model.setStatus(withInspectorate.id);
    }
  };
};
