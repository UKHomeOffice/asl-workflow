const { get } = require('lodash');
const Messager = require('../../messager');

module.exports = settings => {
  const messager = Messager(settings);
  return model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');
    switch (type) {
      case 'project':
        switch (action) {
          case 'grant':
            return messager({ ...model.data, action: 'withdraw' })
              .then(changelogModel => model.patch({ id: changelogModel.modelId }));
        }
    }
    return Promise.resolve();
  };
};
