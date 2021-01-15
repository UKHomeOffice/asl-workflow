const assert = require('assert');
const uuid = require('uuid/v4');
const sinon = require('sinon');
const hook = require('../../../../lib/hooks/resolve');

const modelId = uuid();
const createdId = uuid();

const runHook = hook({ StubMessager: () => Promise.resolve({ modelId: createdId }) });

describe('Resolve hook', () => {
  beforeEach(() => {
    this.model = {
      data: {
        id: modelId,
        data: {
          some: 'value'
        }
      },
      patch: sinon.stub()
    };
  });

  it('updates the data.version if task is a project fork', () => {
    this.model.data.model = 'project';
    this.model.data.action = 'fork';
    const expected = {
      data: {
        ...this.model.data.data,
        version: createdId
      }
    };
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.deepEqual(this.model.patch.lastCall.args[0], expected);
      });
  });

  it('updates the data.raVersion if task is a project fork-ra', () => {
    this.model.data.model = 'project';
    this.model.data.action = 'fork-ra';
    const expected = {
      data: {
        ...this.model.data.data,
        raVersion: createdId
      }
    };
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.deepEqual(this.model.patch.lastCall.args[0], expected);
      });
  });

  it('updates the top level id if not already set', () => {
    this.model.data.model = 'place';
    this.model.data.action = 'create';
    delete this.model.data.id;
    const expected = { id: createdId };
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.deepEqual(this.model.patch.lastCall.args[0], expected);
      });
  });

  it('doesn\'t patch the model if id is already set', () => {
    this.model.data.model = 'place';
    this.model.data.action = 'update';
    return Promise.resolve()
      .then(() => runHook(this.model))
      .then(() => {
        assert.equal(this.model.patch.called, false);
      });
  });
});
