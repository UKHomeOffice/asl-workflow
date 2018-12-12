const { get, values } = require('lodash');
const status = require('./status');
const {
  newCase,
  autoResolved,
  resubmitted,
  returnedToApplicant,
  withNtco,
  ntcoEndorsed,
  withLicensing,
  withdrawnByApplicant,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  resolved,
  rejected
} = require('./status');

const flow = {};

flow[newCase.id] = [autoResolved, withNtco, withLicensing];

// applicant needs to make ammends and re-submit to licensing, or withdraw their application
flow[returnedToApplicant.id] = [resubmitted, withdrawnByApplicant];

// ntco can endorse an application for the licensing team or ask for ammends from the applicant
flow[withNtco.id] = [ntcoEndorsed, returnedToApplicant];

// licensing can return to applicant for ammends, refer to an inspector, grant or reject the licence
flow[withLicensing.id] = [returnedToApplicant, referredToInspector, rejected, resolved];
flow[ntcoEndorsed.id] = [returnedToApplicant, referredToInspector, rejected, resolved];
flow[inspectorRecommended.id] = [returnedToApplicant, rejected, resolved];
flow[inspectorRejected.id] = [returnedToApplicant, rejected, resolved];

// inspector can recommend to licensing that they approve or reject the application
flow[referredToInspector.id] = [inspectorRecommended, inspectorRejected];

const getNextSteps = (currentStepId) => {
  return get(flow, currentStepId, []);
};

const getAllSteps = () => {
  return values(status);
};

module.exports = {
  flow,
  getAllSteps,
  getNextSteps
};
