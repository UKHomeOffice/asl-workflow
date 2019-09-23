const assert = require('assert');

const decorator = require('../../../lib/decorators/delete-comments');

describe('Comment deletion', () => {

  let task;

  beforeEach(() => {
    task = {
      status: 'with-inspectorate',
      withASRU: true,
      createdAt: '2019-09-20T10:00:00.000Z',
      activityLog: [
        {
          id: '1',
          eventName: 'create',
          createdAt: '2019-09-20T10:00:00.000Z'
        },
        {
          id: '2',
          eventName: 'status:new:with-inspectorate',
          createdAt: '2019-09-20T10:00:00.100Z'
        },
        {
          id: '3',
          eventName: 'comment',
          comment: 'foo',
          createdAt: '2019-09-20T11:00:00.000Z'
        },
        {
          id: '4',
          eventName: 'comment',
          comment: 'bar',
          createdAt: '2019-09-20T12:00:00.000Z'
        },
        {
          id: '5',
          eventName: 'delete-comment',
          comment: 'bar',
          event: {
            meta: { id: '3' }
          },
          createdAt: '2019-09-20T12:00:00.000Z'
        }
      ]
    };
  });

  it('removes deleted comments from the activity log', () => {
    const result = decorator()(task);
    assert.equal(result.activityLog.length, 4);

    const comments = result.activityLog.filter(a => a.eventName === 'comment');
    assert.equal(comments.length, 2);
    assert.equal(comments[0].comment, null);
    assert.equal(comments[0].deleted, true);
    assert.equal(comments[1].comment, 'bar');

    const deleted = result.activityLog.filter(a => a.eventName === 'delete-comment');
    assert.equal(deleted.length, 0);
  });

});
