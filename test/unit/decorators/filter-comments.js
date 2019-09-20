const assert = require('assert');

const flow = require('../../../lib/flow');
const decorator = require('../../../lib/decorators/filter-comments');

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
    status: (status, user) => {
      model.activityLog.push({
        eventName: `status:${model.status}:${status}`,
        event: { status, meta: { user } },
        createdAt: timestamp()
      });
      model.status = status;
      model.withASRU = flow.withASRU().includes(status);
    },
    comment: (comment, user) => {
      model.activityLog.push({
        eventName: 'comment',
        comment,
        event: { meta: { user } },
        createdAt: timestamp()
      });
    },
    model
  };

};

const users = {
  asru: { profile: { asruUser: true } },
  external: { profile: { asruUser: false } }
};

const assertComments = (task, user, expected) => {
  const result = decorator()(task.model, user);
  const comments = result.activityLog.filter(a => a.eventName === 'comment');
  assert.equal(comments.length, expected.length);
  assert.deepEqual(comments.map(c => c.comment), expected);
};

describe('Comment filtering', () => {

  describe('when task is with inspectorate', () => {

    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
    });

    it('comments made post-submission are not visible to external users', () => {
      assertComments(task, users.external, []);
    });

    it('all comments are visible to asru users', () => {
      assertComments(task, users.asru, ['one', 'two']);
    });

  });

  describe('when task is returned to applicant', () => {

    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
      task.status('returned-to-applicant', users.asru);
      task.comment('three', users.external);
    });

    it('all comments are visible to external users', () => {
      assertComments(task, users.external, ['one', 'two', 'three']);
    });

    it('comments made post-return are not visible to asru users', () => {
      assertComments(task, users.asru, ['one', 'two']);
    });

  });

  describe('when task is recalled by the applicant', () => {

    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
      task.status('recalled-by-applicant', users.external);
      task.comment('three', users.external);
    });

    it('only comment made post-recall is visible to external users', () => {
      assertComments(task, users.external, ['three']);
    });

    it('only comments made pre-recall are visible to asru users', () => {
      assertComments(task, users.asru, ['one', 'two']);
    });
  });

  describe('when task is recalled and then resubmitted', () => {

    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
      task.status('recalled-by-applicant', users.external);
      task.comment('three', users.external);
      task.status('resubmitted', users.external);
      task.status('with-inspectorate', users.external);
      task.comment('four', users.asru);
    });

    it('only comment made post-recall is visible to external users', () => {
      assertComments(task, users.external, ['three']);
    });

    it('all comments are now visible to asru users', () => {
      assertComments(task, users.asru, ['one', 'two', 'three', 'four']);
    });

  });

  describe('when task is recalled, resubmitted, and then discarded', () => {

    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
      task.status('recalled-by-applicant', users.external);
      task.comment('three', users.external);
      task.status('resubmitted', users.external);
      task.status('with-inspectorate', users.external);
      task.comment('four', users.asru);
      task.status('discarded-by-applicant', users.external);
    });

    it('only comment made post-recall is visible to external users', () => {
      assertComments(task, users.external, ['three']);
    });

    it('all comments are now visible to asru users', () => {
      assertComments(task, users.asru, ['one', 'two', 'three', 'four']);
    });

  });

  describe('when task is recalled, resubmitted, and then returned', () => {

    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
      task.status('recalled-by-applicant', users.external);
      task.comment('three', users.external);
      task.status('resubmitted', users.external);
      task.status('with-inspectorate', users.external);
      task.comment('four', users.asru);
      task.status('returned-to-applicant', users.asru);
      task.comment('five', users.external);
    });

    it('all comments are now visible to external users', () => {
      assertComments(task, users.external, ['one', 'two', 'three', 'four', 'five']);
    });

    it('all comments are now visible to asru users except those made post return', () => {
      assertComments(task, users.asru, ['one', 'two', 'three', 'four']);
    });

  });

});
