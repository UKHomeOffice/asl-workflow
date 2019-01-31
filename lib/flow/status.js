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
  returnedToApplicant: {
    id: 'returned-to-applicant',
    commentRequired: true
  },
  withdrawnByApplicant: {
    id: 'withdrawn-by-applicant',
    commentRequired: false
  },
  withNtco: {
    id: 'with-ntco',
    commentRequired: false
  },
  ntcoEndorsed: {
    id: 'ntco-endorsed',
    commentRequired: false,
    autoForwards: true
  },
  withLicensing: {
    id: 'with-licensing',
    commentRequired: false
  },
  referredToInspector: {
    id: 'referred-to-inspector',
    commentRequired: true
  },
  inspectorRecommended: {
    id: 'inspector-recommended',
    commentRequired: false
  },
  inspectorRejected: {
    id: 'inspector-rejected',
    commentRequired: true
  },
  resolved: {
    id: 'resolved',
    commentRequired: false
  },
  rejected: {
    id: 'rejected',
    commentRequired: true
  }
};
