const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');

const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { closed } = require('../../flow');

module.exports = settings => {
  return model => {

    const id = get(model, 'meta.data.id');

    if (!id) {
      return;
    }

    return Case.query()
      .whereJsonSupersetOf('data', { id })
      .whereNotIn('status', closed())
      .then(results => {
        if (results && results.length) {
          throw new BadRequestError('There is an existing open task for this record');
        }
      });
  };
};
