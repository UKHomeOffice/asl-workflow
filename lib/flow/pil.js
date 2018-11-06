const { returnedToApplicant, submittedToNtco, withLicensing } = require('./status');
const defaultFlow = require('./default');
const pilFlow = {};

// applicant needs to make ammends and re-submit to NTCO
pilFlow[returnedToApplicant] = [submittedToNtco];

// NTCO can return to applicant for ammends or endorse for licensing
pilFlow[submittedToNtco] = [returnedToApplicant, withLicensing];

module.exports = Object.assign({}, defaultFlow, pilFlow);
