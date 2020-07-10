const { get } = require('lodash');

module.exports = settings => event => {
  if (settings.search) {
    const allowed = ['establishment', 'profile', 'project', 'asruEstablishment'];
    let model = get(event, 'data.model');
    if (!allowed.includes(model)) {
      return Promise.resolve();
    }

    let id = get(event, 'data.id');

    if (model === 'asruEstablishment') {
      model = 'establishment';
      id = get(event, 'data.data.establishmentId');
    }

    // note the extra `s` on the model name
    const url = `${settings.search}/${model}s/${id}`;
    const headers = {
      Authorization: `bearer ${event.meta.user.access_token}`
    };

    // don't wait for a response - the action should still complete if search indexing fails
    fetch(url, { method: 'put', headers });
  }
  return Promise.resolve();
};
