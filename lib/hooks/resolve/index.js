const Queue = require('../../queue');

module.exports = settings => {
  const queue = Queue(settings.sqs);

  return model => {
    return queue(model.data);
  };
};
