const { get } = require('lodash');

const {
  resubmitted,
  returnedToApplicant,
  withNtco,
  ntcoEndorsed,
  withLicensing,
  withdrawn,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  resolved,
  rejected
} = require('./status');

const flow = {};

// applicant needs to make ammends and re-submit to licensing, or withdraw their application
flow[returnedToApplicant] = [resubmitted, withdrawn];

// ntco can endorse an application for the licensing team or ask for ammends from the applicant
flow[withNtco] = [ntcoEndorsed, returnedToApplicant];

// licensing can return to applicant for ammends, refer to an inspector, grant or reject the licence
flow[withLicensing] = [returnedToApplicant, referredToInspector, resolved];
flow[ntcoEndorsed] = [returnedToApplicant, referredToInspector, resolved];
flow[inspectorRecommended] = [returnedToApplicant, resolved];
flow[inspectorRejected] = [returnedToApplicant, rejected, resolved];

// inspector can recommend to licensing that they approve or reject the application
flow[referredToInspector] = [inspectorRecommended, inspectorRejected];

const getAllSteps = () => {
  return Object.keys(flow);
};

const getNextSteps = (currentStep) => {
  return get(flow, currentStep, []);
};

module.exports = {
  flow,
  getAllSteps,
  getNextSteps
};
