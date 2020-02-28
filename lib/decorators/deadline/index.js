const { get } = require('lodash');
const Case = require('@ukhomeoffice/taskflow/lib/models/case');
const { withASRU } = require('../../flow');

const completeAndCorrect = require('./complete-and-correct');
const getDeadline = require('./get-deadline');

const hasActiveDeadline = c => {
  const model = get(c, 'data.model');
  const action = get(c, 'data.action');
  const status = get(c, 'status');
  const isAmendment = get(c, 'data.modelData.status') !== 'inactive';
  const meta = get(c, 'data.meta');

  if (model !== 'project' || action !== 'grant' || !withASRU().includes(status) || isAmendment) {
    return false;
  }

  return completeAndCorrect(meta);
};

module.exports = settings => {
  return c => {
    if (!hasActiveDeadline(c)) {
      return Promise.resolve(c);
    }

    return Promise.resolve()
      .then(() => {
        if (!c.activityLog) {
          return Case.find(c.id)
            .then(model => model.toJSON());
        }
        return c;
      })
      .then(model => {
        const deadline = getDeadline(model);
        const isExtendable = c.isOpen && !c.data.extended;

        return {
          ...c,
          deadline,
          isExtendable
        };
      });
  };
};
