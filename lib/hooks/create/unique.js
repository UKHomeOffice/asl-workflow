const { get } = require('lodash');
const match = require('minimatch');
const { BadRequestError } = require('@asl/service/errors');

const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { closed } = require('../../flow');

module.exports = settings => {
  return model => {

    const id = get(model, 'meta.data.id');
    const type = get(model, 'meta.data.model');
    const action = get(model, 'meta.data.action');

    // allow tasks of the following types to be raised even if other open tasks exist
    const nopes = [
      'feeWaiver.*',
      'project.fork',
      'establishment.update-conditions',
      'establishment.update-billing'
    ];

    if (nopes.some(str => match(`${type}.${action}`, str))) {
      return;
    }

    if (!id) {
      return;
    }

    return Case.query()
      .whereJsonSupersetOf('data', { id })
      .whereNotIn('status', closed())
      .where('status', '!=', 'new')
      .then(results => {
        if (results && results.length) {
          throw new BadRequestError('There is an existing open task for this record');
        }
      });
  };
};
