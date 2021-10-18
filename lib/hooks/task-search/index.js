const { autoForwards } = require('../../flow');

module.exports = settings => event => {
  if (settings.search) {
    if (event.status === 'autoresolved' || autoForwards(event.status)) {
      return Promise.resolve();
    }

    const headers = {
      Authorization: `bearer ${event.meta.user.access_token}`
    };

    // re-index the task in the search index
    fetch(`${settings.search}/tasks/${event.id}`, { method: 'put', headers })
      .catch(e => null); // swallow errors
  }
  return Promise.resolve();
};
