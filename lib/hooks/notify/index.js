const fetch = require('r2');

module.exports = settings => json => {
  if (settings.notifications) {
    fetch.post(settings.notifications, { json }).response
      // prevent unresolved promise error being logged if request fails
      .catch(e => null);
  }
  // don't wait for a response, we don't want to block because notifcations failed
  return Promise.resolve();
};
