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
          // allow establishment grant if other tasks establishment tasks are open
          // need to check all open tasks because there might be an update and a grant
          if (type === 'establishment' && action === 'grant' && results.every(task => task.data.action !== 'grant')) {
            return;
          }
          const conflict = results[0];
          const status = conflict.status;
          let conflictAction = conflict.data.action;
          // transfers are submitted as grant tasks.
          if (conflictAction === 'transfer') {
            conflictAction = 'grant';
          }
          // check that the existing task is of the same type and is open
          if (type === conflict.data.model && action === conflictAction && editable().includes(status)) {
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
