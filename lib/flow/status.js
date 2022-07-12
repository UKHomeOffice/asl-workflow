const { get } = require('lodash');
const { canEndorse, onlyRolesChanged } = require('../util');

function isAsruUser(task) {
  return get(task, 'meta.user.profile.asruUser', false);
}

function isInspector(task) {
  return isAsruUser(task) && get(task, 'meta.user.profile.asruInspector', false);
}

function isAsruAdmin(task) {
  return isAsruUser(task) && get(task, 'meta.user.profile.asruAdmin', false);
}

function isLicensing(task) {
  return isAsruUser(task) && get(task, 'meta.user.profile.asruLicensing', false);
}

function isNtcoReview(task) {
  const isReview = get(task, 'data.action') === 'review' && get(task, 'data.model') === 'pil';
  return isReview && canEndorse(task);
}

function asruEstUpdate(task) {
  const model = get(task, 'data.model');
  const action = get(task, 'data.action');
  return isAsruUser(task) && model === 'establishment' && action === 'update';
}

function isHolcAssignment(task) {
  const model = get(task, 'data.model');
  if (model === 'role') {
    const action = get(task, 'data.action');
    // the role will either be on the top level task data or the modelData depending on whether
    // the task is a create or a delete
    const path = action === 'create' ? 'data.data.type' : 'data.modelData.type';
    const role = get(task, path);
    return role === 'holc';
  }
  return false;
}

function isRopSubmission(task) {
  const model = get(task, 'data.model');
  const action = get(task, 'data.action');

  return model === 'rop' && ['submit', 'unsubmit'].includes(action);
}

module.exports = {
  newCase: {
    id: 'new',
    commentRequired: false,
    autoForwards: true
  },
  autoResolved: {
    id: 'autoresolved',
    commentRequired: false
  },
  resubmitted: {
    id: 'resubmitted',
    commentRequired: false,
    autoForwards: true
  },
  updated: {
    id: 'updated',
    commentRequired: false,
    autoForwards: true
  },
  returnedToApplicant: {
    id: 'returned-to-applicant',
    commentRequired: true,
    editable: true
  },
  recalledByApplicant: {
    id: 'recalled-by-applicant',
    commentRequired: false,
    editable: true
  },
  discardedByApplicant: {
    id: 'discarded-by-applicant',
    commentRequired: false
  },
  withdrawnByApplicant: {
    id: 'withdrawn-by-applicant',
    commentRequired: false
  },
  withNtco: {
    id: 'with-ntco',
    commentRequired: false
  },
  awaitingEndorsement: {
    id: 'awaiting-endorsement',
    commentRequired: false
  },
  endorsed: {
    id: 'endorsed',
    commentRequired: false,
    autoForwards: true,
    validate: canEndorse
  },
  withLicensing: {
    id: 'with-licensing',
    commentRequired: false,
    withASRU: true
  },
  withInspectorate: {
    id: 'with-inspectorate',
    commentRequired: false,
    withASRU: true
  },
  referredToInspector: {
    id: 'referred-to-inspector',
    commentRequired: true,
    withASRU: true
  },
  inspectorRecommended: {
    id: 'inspector-recommended',
    commentRequired: false,
    withASRU: true,
    validate: isInspector
  },
  inspectorRejected: {
    id: 'inspector-rejected',
    commentRequired: true,
    withASRU: true,
    validate: isInspector
  },
  resolved: {
    id: 'resolved',
    commentRequired: false,
    validate: task =>
      isInspector(task) ||
      isLicensing(task) ||
      isNtcoReview(task) ||
      isHolcAssignment(task) ||
      onlyRolesChanged(task) ||
      asruEstUpdate(task) ||
      isRopSubmission(task)
  },
  rejected: {
    id: 'rejected',
    commentRequired: true
  },
  recovered: {
    id: 'recovered',
    commentRequired: false,
    validate: isAsruAdmin,
    autoForwards: true
  },
  discardedByAsru: {
    id: 'discarded-by-asru',
    commentRequired: true
  },
  intentionToRefuse: {
    id: 'intention-to-refuse',
    commentRequired: true,
    autoForwards: true,
    validate: isInspector
  },
  refused: {
    id: 'refused',
    commentRequired: true,
    validate: isInspector
  }
};
