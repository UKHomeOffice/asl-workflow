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
    commentRequired: false
  },
  withInspectorate: {
    id: 'with-inspectorate',
    commentRequired: false
  },
  referredToInspector: {
    id: 'referred-to-inspector',
    commentRequired: true
  },
  inspectorRecommended: {
    id: 'inspector-recommended',
    commentRequired: false,
    validate: profile => profile.asruUser && profile.asruInspector
  },
  inspectorRejected: {
    id: 'inspector-rejected',
    commentRequired: true,
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
