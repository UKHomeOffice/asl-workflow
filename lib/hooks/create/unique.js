const { get } = require('lodash');
const { BadRequestError } = require('@asl/service/errors');

const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { closed } = require('../../flow');

module.exports = settings => {
  return model => {

    const id = get(model, 'meta.data.id');
    const type = get(model, 'meta.data.model');
    const action = get(model, 'meta.data.action');

    // skip if forking a project
    if (type === 'project' && action === 'fork') {
      return;
    }

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
