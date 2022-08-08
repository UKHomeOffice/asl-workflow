const { get, values } = require('lodash');
const statuses = require('./status');
const {
  newCase,
  autoResolved,
  updated,
  resubmitted,
  returnedToApplicant,
  awaitingEndorsement,
  endorsed,
  withNtco,
  withLicensing,
  withInspectorate,
  recalledByApplicant,
  discardedByApplicant,
  referredToInspector,
  inspectorRecommended,
  inspectorRejected,
  resolved,
  rejected,
  recovered,
  intentionToRefuse
} = statuses;

const flow = {};

flow[newCase.id] = [
  autoResolved,
  withNtco,
  awaitingEndorsement,
  endorsed,
  withInspectorate,
  withLicensing,
  resolved
];
// resubmissions should follow the same rules as new submissions
flow[resubmitted.id] = [...flow[newCase.id]];

// applicant needs to make ammends and re-submit to licensing, or withdraw their application
flow[returnedToApplicant.id] = [updated, resubmitted, discardedByApplicant];
flow[recalledByApplicant.id] = [...flow[returnedToApplicant.id]];

flow[updated.id] = [resubmitted];

// ntco can endorse an application for the licensing team or ask for ammends from the applicant
flow[withNtco.id] = [endorsed, returnedToApplicant];

flow[awaitingEndorsement.id] = [endorsed, returnedToApplicant];
flow[endorsed.id] = [withInspectorate, withLicensing, awaitingEndorsement, resolved];

// licensing can return to applicant for ammends, refer to an inspector, grant or reject the licence
flow[withLicensing.id] = [returnedToApplicant, referredToInspector, rejected, resolved];
flow[inspectorRecommended.id] = [returnedToApplicant, referredToInspector, rejected, resolved];
flow[inspectorRejected.id] = [returnedToApplicant, referredToInspector, rejected, resolved];

// inspector can recommend to licensing that they approve or reject the application
flow[withInspectorate.id] = [resolved, rejected, returnedToApplicant];
flow[referredToInspector.id] = [resolved, rejected, returnedToApplicant];

// intention to refuse autoforwards to the standard returned to applicant flow
flow[intentionToRefuse.id] = [returnedToApplicant];

flow[recovered.id] = [withInspectorate];

const getNextSteps = c => {
  const action = get(c, 'data.action');
  const model = get(c, 'data.model');
  const nextSteps = [
    ...get(flow, c.status, [])
  ];
  // delete revoke, and review tasks do not include any
  // data apart from supporting comments
  // TODO: allow trainingPil to be updated
  if (['delete', 'revoke', 'review'].includes(action) || model === 'trainingPil') {
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

const open = () => {
  const nopes = closed();
  return values(statuses).map(s => s.id).filter(s => !nopes.includes(s));
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
  open,
  getAllSteps,
  getNextSteps,
  autoForwards,
  withASRU,
  editable
};
