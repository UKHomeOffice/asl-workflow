const Queue = require('../../queue');
const db = require('@asl/schema');
const { TimeoutError } = require('../../errors');

const POLL_TIMEOUT = 5000;
const POLL_INTERVAL = 300;

module.exports = settings => {
  const queue = Queue(settings.sqs);
  const { Changelog } = db(settings.db);

  const pollChangelog = id => {
    const endTime = Number(new Date()) + POLL_TIMEOUT;

    const checkCondition = (resolve, reject) => {
      console.log(`Polling changelog for: ${id}`);
      Promise.resolve()
        .then(() => Changelog.query().findById(id))
        .then(resolved => Boolean(resolved))
        .then(success => {
          if (success === true) {
            return resolve(true);
          } else if (Number(new Date()) < endTime) {
            setTimeout(checkCondition, POLL_INTERVAL, resolve, reject);
          } else {
            return reject(new TimeoutError());
          }
        });
    };
    return new Promise(checkCondition);
  };

  return model => {
    return queue(model.data)
      .then(response => pollChangelog(response.MessageId));
  };
};
