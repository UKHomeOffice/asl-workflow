const flow = require('../../lib/flow');

const History = () => {

  const model = {
    status: 'new',
    withASRU: false,
    createdAt: '2019-09-20T10:00:00.000Z',
    activityLog: [
      { eventName: 'create', createdAt: '2019-09-20T10:00:00.000Z' }
    ]
  };

  const timestamp = () => {
    const count = model.activityLog.length;
    return count < 10 ? `2019-09-20T10:00:0${count}.000Z` : `2019-09-20T10:00:${count}.000Z`;
  };

  return {
    status: (status, user, payloadStatus) => {
      model.activityLog.unshift({
        eventName: `status:${model.status}:${status}`,
        event: { status, meta: { user, payload: { status: payloadStatus } } },
        createdAt: timestamp()
      });
      model.status = status;
      model.withASRU = flow.withASRU().includes(status);
    },
    comment: (comment, user) => {
      model.activityLog.unshift({
        eventName: 'comment',
        comment,
        event: { meta: { user } },
        createdAt: timestamp()
      });
    },
    model
  };

};

module.exports = History;
