/* eslint-disable no-multi-spaces */
module.exports = {
  // nothing to do
  autoresolved: [],

  // applicant needs to make ammends and re-submit to NTCO
  with_applicant: ['with_ntco'],

  // NTCO can return to applicant for ammends or endorse for licensing
  with_ntco: ['with_applicant', 'with_licensing'],

  // licensing can return to applicant for ammends, refer to inspector, or grant the licence
  with_licensing: ['with_applicant', 'with_inspector', 'resolved'],

  // inspector can recommend to licensing that they approve or reject the application
  with_inspector: ['with_licensing'],

  // licence granted
  resolved: []
};
