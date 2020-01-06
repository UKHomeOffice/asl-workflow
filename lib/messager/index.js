const Queue = require('./queue');
const S3 = require('./s3');
const { TimeoutError } = require('../errors');

module.exports = settings => {
  const queue = Queue(settings.sqs);
  const store = S3(settings.s3);

  const { Changelog } = settings.models;

  const POLL_TIMEOUT = settings.sqs.pollTimeout;
  const POLL_INTERVAL = settings.sqs.pollInterval;

  const pollChangelog = id => {
    const endTime = Number(new Date()) + POLL_TIMEOUT;

    const checkCondition = (resolve, reject) => {
      console.log(`Polling changelog for: ${id}`);
      Promise.resolve()
        .then(() => Changelog.query().findById(id))
        .then(model => {
          if (model) {
            if (model.action === 'error') {
              return reject(new Error(model.state.message || 'Resolver failed'));
            }
            return resolve(model);
          } else if (Number(new Date()) < endTime) {
            setTimeout(checkCondition, POLL_INTERVAL, resolve, reject);
          } else {
            return reject(new TimeoutError());
          }
        });
    };
    return new Promise(checkCondition);
  };

  if (settings.noDownstream) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Do not set `noDownstream` configuration option in prod environments!');
    }
    return () => Promise.resolve();
  }

  return data => {
    return Promise.resolve()
      .then(() => store(data))
      .then(id => queue(id))
      .then(response => pollChangelog(response.MessageId));
  };
};
