const assert = require('assert');
const sinon = require('sinon');
const decorator = require('../../../lib/decorators/activity-log');
const History = require('../../helpers/history');

let task;

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

const runDecorator = decorator(settings);

const users = {
  anon: { },
  asru: { profile: { asruUser: true } },
  external: { profile: { asruUser: false } }
};

describe('Activity log', () => {
  beforeEach(() => {
    task = History();
  });

  it('filters out comments', () => {
    task.status('with-inspectorate', users.external);
    task.comment('one', users.asru);
    task.comment('two', users.asru);
    return Promise.resolve()
      .then(() => runDecorator(task.model))
      .then(({ activityLog }) => {
        assert.equal(activityLog.length, 1);
        assert.equal(activityLog[0].action, 'with-inspectorate');
        assert.equal(activityLog[0].status, 'with-inspectorate');
      });
  });

  it('groups together autoforwarding status changes', () => {
    task.status('awaiting-endorsement', users.external);
    task.status('endorsed', users.external, 'endorsed');
    // autoforward to awaiting endorsement
    task.status('awaiting-endorsement', users.external, 'endorsed');
    return Promise.resolve()
      .then(() => runDecorator(task.model))
      .then(({ activityLog }) => {
        assert.equal(activityLog.length, 2);
        assert.equal(activityLog[1].action, 'endorsed');
        assert.equal(activityLog[1].status, 'awaiting-endorsement');
      });
  });
});
