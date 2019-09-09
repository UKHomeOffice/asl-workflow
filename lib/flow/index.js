const { get, values } = require('lodash');
const statuses = require('./status');
const {
  newCase,
  autoResolved,
  updated,
  resubmitted,
  returnedToApplicant,
  withNtco,
  ntcoEndorsed,
  withLicensing,
  withInspectorate,
  recalledByApplicant,
  discardedByApplicant,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  resolved,
  rejected
} = statuses;

const flow = {};

flow[newCase.id] = [autoResolved, withNtco, withInspectorate, withLicensing];

// applicant needs to make ammends and re-submit to licensing, or withdraw their application
flow[returnedToApplicant.id] = [updated, resubmitted, discardedByApplicant];
flow[recalledByApplicant.id] = [updated, resubmitted, discardedByApplicant];

flow[updated.id] = [resubmitted];
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

const getNextSteps = c => {
  const action = get(c, 'data.action');
  const nextSteps = get(flow, c.status, []);
  // delete and revoke tasks do not include any
  // data apart from supporting comments
  if (['delete', 'revoke'].includes(action)) {
    return nextSteps.filter(s => s.id !== updated.id);
  }
  return nextSteps;
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

const withASRU = () => {
  return values(statuses).filter(s => s.withASRU === true).map(s => s.id);
};

const editable = () => {
  return values(statuses).filter(s => s.editable).map(s => s.id);
};

module.exports = {
  flow,
  closed,
  getAllSteps,
  getNextSteps,
  autoForwards,
  withASRU,
  editable
};
