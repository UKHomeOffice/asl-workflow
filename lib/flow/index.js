const { get, values } = require('lodash');
const statuses = require('./status');
const {
  newCase,
  autoResolved,
  resubmitted,
  returnedToApplicant,
  withNtco,
  ntcoEndorsed,
  withLicensing,
  withInspectorate,
  withdrawnByApplicant,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  resolved,
  rejected
} = statuses;

const flow = {};

flow[newCase.id] = [autoResolved, withNtco, withInspectorate];

// applicant needs to make ammends and re-submit to licensing, or withdraw their application
flow[returnedToApplicant.id] = [resubmitted, withdrawnByApplicant];
flow[resubmitted.id] = [withLicensing, withNtco, withInspectorate];

// ntco can endorse an application for the licensing team or ask for ammends from the applicant
flow[withNtco.id] = [ntcoEndorsed, returnedToApplicant];

flow[ntcoEndorsed.id] = [withLicensing];

// licensing can return to applicant for ammends, refer to an inspector, grant or reject the licence
flow[withLicensing.id] = [returnedToApplicant, referredToInspector, rejected, resolved];
flow[inspectorRecommended.id] = [returnedToApplicant, referredToInspector, rejected, resolved];
flow[inspectorRejected.id] = [returnedToApplicant, referredToInspector, rejected, resolved];

// inspector can recommend to licensing that they approve or reject the application
flow[withInspectorate.id] = [inspectorRecommended, inspectorRejected, returnedToApplicant];
flow[referredToInspector.id] = [inspectorRecommended, inspectorRejected, returnedToApplicant];

const getNextSteps = (currentStepId) => {
  return get(flow, currentStepId, []);
};

const getAllSteps = () => {
  return values(statuses);
};

const autoForwards = status => {
  const current = values(statuses).find(s => s.id === status);
  return current.autoForwards;
};

const closed = () => {
  return values(statuses).map(s => s.id).filter(s => !flow[s] || !flow[s].length);
};

module.exports = {
  flow,
  closed,
  getAllSteps,
  getNextSteps,
  autoForwards
};
