const fetch = require('r2');

module.exports = settings => json => {
  if (settings.notifications) {
    fetch.post(settings.notifications, { json });
  }
  // don't wait for a response, we don't want to block because notifcations failed
  return Promise.resolve();
};
