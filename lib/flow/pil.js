const status = require('./status');
const defaultFlow = require('./default');
const pilFlow = {};

// applicant needs to make ammends and re-submit to NTCO
pilFlow[status.returnedToApplicant] = [status.submittedToNtco];

// NTCO can return to applicant for ammends or endorse for licensing
pilFlow[status.submittedToNtco] = [status.returnedToApplicant, status.withLicensing];

module.exports = Object.assign({}, defaultFlow, pilFlow);
