const fetch = require('node-fetch');
const { get } = require('lodash');

module.exports = settings => event => {
  if (settings.search) {
    const allowed = [
      'enforcementCase',
      'establishment',
      'permission',
      'pil',
      'place',
      'profile',
      'project',
      'role',
      'trainingPil'
    ];

    let model = get(event, 'data.model');
    let id = get(event, 'data.id');
    const action = get(event, 'data.action');

    if (!allowed.includes(model)) {
      return Promise.resolve();
    }

    if (['pil', 'trainingPil', 'permission'].includes(model)) {
      model = 'profile';
      id = get(event, 'data.data.profileId');
    }

    if (model === 'role') {
      model = 'establishment';
      id = get(event, 'data.data.establishmentId');
    }

    if (model === 'enforcementCase') {
      model = 'enforcement';
    }

    if (!id) {
      return Promise.resolve();
    }

    // note the extra `s` on the model name
    const url = `${settings.search}/${model}s/${id}`;
    const headers = {
      Authorization: `bearer ${event.meta.user.access_token}`
    };

    event.onSettled(() => {
      // don't wait for a response - the action should still complete if search indexing fails
      fetch(url, { method: 'put', headers })
        .catch(() => null); // swallow errors

      // send a second request to the other profile when merging profiles
      if (model === 'profile' && action === 'merge') {
        id = get(event, 'data.data.target');
        fetch(`${settings.search}/${model}s/${id}`, { method: 'put', headers })
          .catch(() => null); // swallow errors
      }
    });
  }
  return Promise.resolve();
};
