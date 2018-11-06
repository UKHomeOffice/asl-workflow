const status = require('./status');
const defaultFlow = {};

// nothing to do
defaultFlow[status.autoResolved] = [];

// applicant needs to make ammends and re-submit to licensing
defaultFlow[status.returnedToApplicant] = [status.withLicensing, status.withdrawn];

// licensing can return to applicant for ammends, refer to inspector, or grant the licence
defaultFlow[status.withLicensing] = [status.returnedToApplicant, status.referredToInspector, status.resolved];

// inspector can recommend to licensing that they approve or reject the application
defaultFlow[status.referredToInspector] = [status.recommended, status.notRecommended];

// licence granted
defaultFlow[status.resolved] = [];

module.exports = defaultFlow;
