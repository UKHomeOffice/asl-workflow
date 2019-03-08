const fetch = require('r2');

module.exports = settings => json => {
  // don't wait for a response, we don't want to block because notifcations failed

  fetch.post(settings.notifications.url, { json: json });
  return Promise.resolve();
};
