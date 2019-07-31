const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);
  return model => {
    const action = get(model, 'data.action');
    switch (action) {
      case 'grant':
        return messager({ ...model.data, action: 'withdraw' })
          .then(changelogModel => model.patch({ id: changelogModel.modelId }));
    }
  };
};
