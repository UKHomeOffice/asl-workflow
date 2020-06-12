const { get } = require('lodash');
const { canEndorse, onlyRolesChanged } = require('../util');

function isAsruUser(task) {
  return get(task, 'meta.user.profile.asruUser', false);
}

function isInspector(task) {
  return isAsruUser(task) && get(task, 'meta.user.profile.asruInspector', false);
}

function isLicensing(task) {
  return isAsruUser(task) && get(task, 'meta.user.profile.asruLicensing', false);
}

function isNtcoReview(task) {
  const isReview = get(task, 'data.action') === 'review' && get(task, 'data.model') === 'pil';
  return isReview && canEndorse(task);
}

function isHolcAssignment(task) {
  const action = get(task, 'data.action');
  return get(task, 'data.model') === 'role' &&
    ['create', 'delete'].includes(action) &&
    get(task, 'data.data.type') === 'holc';
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
    validate: task => isLicensing(task) ||
      isNtcoReview(task) ||
      isHolcAssignment(task) ||
      onlyRolesChanged(task)
  },
  rejected: {
    id: 'rejected',
    commentRequired: true
  },
  discardedByAsru: {
    id: 'discarded-by-asru',
    commentRequired: true
  }
};
