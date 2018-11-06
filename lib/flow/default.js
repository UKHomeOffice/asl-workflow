const {
  autoResolved,
  returnedToApplicant,
  withLicensing,
  withdrawn,
  referredToInspector,
  recommended,
  notRecommended,
  resolved
} = require('./status');

const defaultFlow = {};

// nothing to do
defaultFlow[autoResolved] = [];

// applicant needs to make ammends and re-submit to licensing
defaultFlow[returnedToApplicant] = [withLicensing, withdrawn];

// licensing can return to applicant for ammends, refer to inspector, or grant the licence
defaultFlow[withLicensing] = [returnedToApplicant, referredToInspector, resolved];

// inspector can recommend to licensing that they approve or reject the application
defaultFlow[referredToInspector] = [recommended, notRecommended];

// licence granted
defaultFlow[resolved] = [];

module.exports = defaultFlow;
