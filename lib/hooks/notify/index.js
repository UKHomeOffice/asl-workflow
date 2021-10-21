const fetch = require('node-fetch');

module.exports = settings => event => {
  if (settings.notifications) {
    fetch(settings.notifications, {
      method: 'post',
      body: JSON.stringify(event),
      headers: {'Content-Type': 'application/json'}
    })
      // prevent unresolved promise error being logged if request fails
      .catch(e => null);
  }
  // don't wait for a response, we don't want to block because notifcations failed
  return Promise.resolve();
};
