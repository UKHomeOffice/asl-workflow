const defaultFlow = require('./default');

module.exports = Object.assign({}, defaultFlow, {
  // applicant needs to make ammends and re-submit to NTCO
  applicant: ['ntco'],

  // NTCO can return to applicant for ammends or endorse for licensing
  ntco: ['applicant', 'licensing']
});
