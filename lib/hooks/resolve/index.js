const Queue = require('../../queue');
const S3 = require('../../s3');
const { TimeoutError } = require('../../errors');

// 30 second timeout
const POLL_TIMEOUT = 30000;
const POLL_INTERVAL = 300;

module.exports = settings => {
  const queue = Queue(settings.sqs);
  const store = S3(settings.s3);

  const { Changelog } = settings.models;

  const pollChangelog = id => {
    const endTime = Number(new Date()) + POLL_TIMEOUT;

    const checkCondition = (resolve, reject) => {
      console.log(`Polling changelog for: ${id}`);
      Promise.resolve()
        .then(() => Changelog.query().findById(id))
        .then(model => {
          if (model) {
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
      throw new Error('DO not set `noDownstream` configuration option in prod environments!');
    }
    return () => Promise.resolve();
  }

  return model => {
    return Promise.resolve()
      .then(() => store(model.data))
      .then(id => queue(id))
      .then(response => pollChangelog(response.MessageId))
      .then(changelogModel => model.update({ ...model.data, id: changelogModel.modelId }));
  };
};
