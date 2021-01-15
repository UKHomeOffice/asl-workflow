const uuid = require('uuid/v4');
const assert = require('assert');
const sinon = require('sinon');
const hook = require('../../../../lib/hooks/recall');

const messagerStub = sinon.stub();
const changedBy = uuid();

const runHook = hook({ StubMessager: messagerStub });

describe('Recall hook', () => {
  beforeEach(() => {
    messagerStub.reset();
    this.model = {
      data: {
        model: 'project',
        action: 'grant',
        data: {
          some: 'data'
        }
      },
      meta: {
        user: {
          profile: {
            id: changedBy
          }
        }
      }
    };
  });

  it('sends a fork action to resolver on project grant', () => {
    const expected = {
      ...this.model.data,
      action: 'fork',
      meta: { changedBy }
    };
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.deepEqual(messagerStub.lastCall.args[0], expected);
      });
  });

  it('sends a fork action to resolver on project grant-ra', () => {
    this.model.data.action = 'grant-ra';
    const expected = {
      ...this.model.data,
      action: 'fork-ra',
      meta: { changedBy }
    };
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.deepEqual(messagerStub.lastCall.args[0], expected);
      });
  });

  it('sends a fork action to resolver on project transfer', () => {
    this.model.data.action = 'transfer';
    const expected = {
      ...this.model.data,
      action: 'fork',
      meta: { changedBy }
    };
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.deepEqual(messagerStub.lastCall.args[0], expected);
      });
  });

  it('doesn\'t call messager if model is not project', () => {
    this.model.data.model = 'pil';
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.equal(messagerStub.called, false);
      });
  });
});
