const { get } = require('lodash');
const match = require('minimatch');
const { BadRequestError } = require('@asl/service/errors');

const { Task } = require('@ukhomeoffice/taskflow');
const { closed, editable } = require('../../flow');
const { resubmitted } = require('../../flow/status');

module.exports = settings => {
  return model => {

    const id = get(model, 'meta.data.id');
    const type = get(model, 'meta.data.model');
    const action = get(model, 'meta.data.action');
    const data = get(model, 'meta.data.data');

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

    return Task.query()
      .whereJsonSupersetOf('data', { id })
      .whereNotIn('status', closed())
      .where('status', '!=', 'new')
      .then(results => {
        if (results && results.length) {
          const conflict = results[0];
          const status = conflict.status;
          // check that the existing task is of the same type and is open
          if (type === conflict.data.model && action === conflict.data.action && editable().includes(status)) {
            return model.find(conflict.id)
              .then(task => {
                return Promise.resolve()
                  // update the existing task with new data
                  .then(() => task.patch({ data }, model.meta))
                  // mark existing task as resubmitted
                  .then(() => task.status(resubmitted.id, model.meta));
              })
              .then(() => model.redirect(conflict.id));
          }
          throw new BadRequestError('There is an existing open task for this record');
        }
      });
  };
};
