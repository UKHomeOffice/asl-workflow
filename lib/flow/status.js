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
    commentRequired: true
  },
  recalledByApplicant: {
    id: 'recalled-by-applicant',
    commentRequired: false
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
  ntcoEndorsed: {
    id: 'ntco-endorsed',
    commentRequired: false,
    autoForwards: true
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
    validate: profile => profile.asruUser && profile.asruInspector
  },
  inspectorRejected: {
    id: 'inspector-rejected',
    commentRequired: true,
    withASRU: true,
    validate: profile => profile.asruUser && profile.asruInspector
  },
  resolved: {
    id: 'resolved',
    commentRequired: false,
    validate: profile => profile.asruUser && profile.asruLicensing
  },
  rejected: {
    id: 'rejected',
    commentRequired: true
  }
};
