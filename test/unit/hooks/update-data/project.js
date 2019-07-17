const assert = require('assert');
const sinon = require('sinon');
const { set } = require('lodash');

const hook = require('../../../../lib/hooks/update-data/project');

describe('Project update hook', () => {

  beforeEach(() => {
    this.model = {
      data: {
        data: {},
        meta: {}
      },
      meta: {
        payload: {
          meta: {}
        }
      },
      update: sinon.stub()
    };
  });

  it('exports a function', () => {
    assert.equal(typeof hook, 'function');
  });

  it('saves the version to `data`', () => {
    set(this.model, 'meta.payload.meta.version', 'abc-123');
    hook({}, this.model);

    assert.ok(this.model.update.calledOnce);
    assert.deepEqual(this.model.update.lastCall.args[0], {
      data: { version: 'abc-123' },
      meta: {}
    });
  });

  it('saves the authorisations to `meta`', () => {
    set(this.model, 'meta.payload.meta.authority', true);
    set(this.model, 'meta.payload.meta.awerb', false);
    set(this.model, 'meta.payload.meta.ready', true);
    hook({}, this.model);

    assert.ok(this.model.update.calledOnce);
    assert.deepEqual(this.model.update.lastCall.args[0], {
      data: {},
      meta: {
        authority: true,
        awerb: false,
        ready: true
      }
    });
  });

  it('does not save any additional fields', () => {
    set(this.model, 'meta.payload.meta.authority', true);
    set(this.model, 'meta.payload.meta.awerb', false);
    set(this.model, 'meta.payload.meta.ready', true);
    set(this.model, 'meta.payload.meta.other', true);
    hook({}, this.model);

    assert.ok(this.model.update.calledOnce);
    assert.deepEqual(this.model.update.lastCall.args[0], {
      data: {},
      meta: {
        authority: true,
        awerb: false,
        ready: true
      }
    });
  });

  it('will save a version and authorisations', () => {
    set(this.model, 'meta.payload.meta.version', 'abc-123');
    set(this.model, 'meta.payload.meta.authority', true);
    set(this.model, 'meta.payload.meta.awerb', false);
    set(this.model, 'meta.payload.meta.ready', true);
    hook({}, this.model);

    assert.ok(this.model.update.calledOnce);
    assert.deepEqual(this.model.update.lastCall.args[0], {
      data: {
        version: 'abc-123'
      },
      meta: {
        authority: true,
        awerb: false,
        ready: true
      }
    });
  });

});
