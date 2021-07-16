const assert = require('assert');
const sinon = require('sinon');

const decorator = require('../../../lib/decorators/filter-comments');
const History = require('../../helpers/history');

const users = {
  anon: { },
  asru: { profile: { asruUser: true } },
  external: { profile: { asruUser: false } }
};

const assertComments = async (task, user, expected) => {
  const settings = {
    models: {
      Profile: {
        queryWithDeleted: sinon.stub().returns({
          findById: sinon.stub().returns({
            then: sinon.stub().returns([])
          })
        })
      }
    }
  };
  const result = await decorator(settings)(task.model, user);
  const comments = result.comments;
  assert.equal(comments.length, expected.length);
  expected = expected.map(e => {
    if (typeof e === 'string') {
      return {
        comment: e
      };
    }
    return e;
  });
  expected.forEach((item, i) => sinon.assert.match(comments[i], item));
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
      assertComments(task, users.asru, ['two', 'one']);
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
      assertComments(task, users.external, ['three', 'two', 'one']);
    });

    it('comments made post-return are not visible to asru users', () => {
      assertComments(task, users.asru, ['two', 'one']);
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
      return assertComments(task, users.external, ['three']);
    });

    it('only comments made pre-recall are visible to asru users', () => {
      return assertComments(task, users.asru, ['two', 'one']);
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
      return assertComments(task, users.external, ['three']);
    });

    it('all comments are now visible to asru users', () => {
      return assertComments(task, users.asru, ['four', 'three', 'two', 'one']);
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
      return assertComments(task, users.external, ['three']);
    });

    it('all comments are now visible to asru users', () => {
      return assertComments(task, users.asru, ['four', 'three', 'two', 'one']);
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
      return assertComments(task, users.external, ['five', 'four', 'three', 'two', 'one']);
    });

    it('all comments are now visible to asru users except those made post return', () => {
      return assertComments(task, users.asru, ['four', 'three', 'two', 'one']);
    });

  });

  describe('when a task is an autoresolved profile creation - bugfix', () => {

    it('doesn\'t throw as a result of status changes with no user profile', () => {
      const task = History();
      task.status('autoresolved', users.anon);

      return assertComments(task, users.anon, []);
    });

  });

  describe('when a task is rejected and recovered - bugfix', () => {
    let task;

    beforeEach(() => {
      task = History();
      task.status('with-inspectorate', users.external);
      task.comment('one', users.asru);
      task.comment('two', users.asru);
      task.status('rejected', users.asru);
      task.status('recovered', users.asru);
      task.comment('three', users.asru);
    });

    it('all comments are marked as new', () => {
      const expected = [
        { comment: 'three', isNew: true },
        { comment: 'two', isNew: true },
        { comment: 'one', isNew: true }
      ];
      return assertComments(task, users.asru, expected);
    });
  });

});
