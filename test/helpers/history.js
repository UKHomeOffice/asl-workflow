const flow = require('../../lib/flow');

const History = (model) => {

  model = model || {
    status: 'new',
    withASRU: false,
    createdAt: '2019-09-20T10:00:00.000Z',
    activityLog: [
      { eventName: 'create', event: {}, createdAt: '2019-09-20T10:00:00.000Z' }
    ]
  };

  const timestamp = () => {
    const count = model.activityLog.length;
    return count < 10 ? `2019-09-20T10:00:0${count}.000Z` : `2019-09-20T10:00:${count}.000Z`;
  };

  return {
    setReqId: req => {
      model.req = req;
    },
    status: (status, user, payloadStatus) => {
      model.activityLog.unshift({
        eventName: `status:${model.status}:${status}`,
        event: {
          req: model.req,
          status,
          meta: {
            previous: model.status,
            user,
            payload: {
              status: payloadStatus
            }
          }
        },
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
