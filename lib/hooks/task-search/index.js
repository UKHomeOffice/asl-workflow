const fetch = require('node-fetch');
const { get } = require('lodash');
const { autoForwards } = require('../../flow');

module.exports = settings => event => {
  if (settings.search) {
    const nextStatus = get(event, 'meta.next');

    if (event.status === 'autoresolved' || (nextStatus && autoForwards(nextStatus)) || autoForwards(event.status)) {
      return Promise.resolve();
    }

    const headers = {
      Authorization: `bearer ${event.meta.user.access_token}`
    };

    event.onSettled(() => {
      // re-index the task in the search index
      fetch(`${settings.search}/tasks/${event.id}`, { method: 'put', headers })
        .catch(e => null); // swallow errors
    });
  }
  return Promise.resolve();
};
