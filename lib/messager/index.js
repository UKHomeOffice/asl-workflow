const Queue = require('./queue');
const S3 = require('./s3');
const { TimeoutError } = require('../errors');

module.exports = settings => {
  if (settings.StubMessager) {
    return settings.StubMessager;
  }
  const queue = Queue(settings.sqs);
  const store = S3(settings.s3);

  const { Changelog } = settings.models;

  const POLL_TIMEOUT = settings.sqs.pollTimeout;
  const POLL_INTERVAL = settings.sqs.pollInterval;

  const wait = t => new Promise(resolve => setTimeout(resolve, t));

  const pollChangelog = id => {
    const endTime = Number(new Date()) + POLL_TIMEOUT;

    const checkCondition = () => {
      return wait(POLL_INTERVAL)
        .then(() => console.log(`Polling changelog for: ${id}`))
        .then(() => Changelog.query().findById(id))
        .then(model => {
          if (model) {
            if (model.action === 'error') {
              throw new Error(model.state.message || 'Resolver failed');
            }
            return model;
          } else if (Number(new Date()) < endTime) {
            return checkCondition();
          } else {
            throw new TimeoutError();
          }
        });
    };
    return checkCondition();
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
