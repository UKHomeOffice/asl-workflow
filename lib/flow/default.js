module.exports = {
  // nothing to do
  autoresolved: [],

  // applicant needs to make ammends and re-submit to licensing
  applicant: ['licensing'],

  // licensing can return to applicant for ammends, refer to inspector, or grant the licence
  licensing: ['applicant', 'inspector', 'resolved'],

  // inspector can recommend to licensing that they approve or reject the application
  inspector: ['licensing'],

  // licence granted
  resolved: []
};
