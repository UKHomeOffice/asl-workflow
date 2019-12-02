const assert = require('assert');
const sinon = require('sinon');
const hook = require('../../../../lib/hooks/edit-and-resubmit');

const runHook = hook({});

describe('Edit and resubmit hook', () => {
  beforeEach(() => {
    this.model = {
      data: {
        model: 'pil',
        data: {},
        meta: {}
      },
      meta: {
        payload: {
          data: {},
          meta: {}
        }
      },
      patch: sinon.stub()
    };
  });

  it('extends data and meta from payload', () => {
    this.model.data.data = {
      field1: 'Hello',
      field2: 'World'
    };

    this.model.meta.payload = {
      data: {
        field1: 'Goodbye'
      },
      meta: {
        comments: 'Adios'
      }
    };

    const expected = {
      model: 'pil',
      data: { field1: 'Goodbye', field2: 'World' },
      meta: {
        comments: 'Adios'
      }
    };

    runHook(this.model);

    assert.ok(this.model.patch.calledOnce);
    assert.deepEqual(this.model.patch.lastCall.args[0], expected);
  });

  it('doesn\'t merge arrays (regression)', () => {
    this.model.data.data = {
      arrayField: [1, 2, 3]
    };

    this.model.meta.payload = {
      data: {
        arrayField: [4, 5, 6]
      }
    };

    const expected = {
      model: 'pil',
      data: { arrayField: [4, 5, 6] },
      meta: {}
    };

    runHook(this.model);

    assert.ok(this.model.patch.calledOnce);
    assert.deepEqual(this.model.patch.lastCall.args[0], expected);
  });

});
