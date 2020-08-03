const assert = require('assert');
const messager = require('../../../lib/messager');

describe('Messager', () => {

  it('exports a function', () => {
    assert.equal(typeof messager, 'function');
  });

  describe('invocation', () => {

    before(() => {
      this.messager = messager({
        s3: {},
        sqs: {},
        models: {}
      });
    });

    it('is a function', () => {
      assert.equal(typeof this.messager, 'function');
    });

    it('returns a promise', () => {
      const result = this.messager({});
      assert(result instanceof Promise);
      return result.catch(e => null);
    });

  });

});
