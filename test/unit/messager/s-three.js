const assert = require('assert');
const s3 = require('../../../lib/messager/s3');

describe('Messager S3', () => {

  it('exports a function that returns a function', () => {
    assert.equal(typeof s3, 'function');
    assert.equal(typeof s3({}), 'function');
  });

  it('returns a promise', () => {
    const result = s3({})({});
    assert(result instanceof Promise);
    return result.catch(e => null);
  });

});
