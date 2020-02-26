const { get } = require('lodash');

// declarations can be 'Yes', 'No', or 'Not yet'
const declarationConfirmed = declaration => declaration && declaration.toLowerCase() === 'yes';

module.exports = task => {
  const { authority, awerb, ready } = get(task, 'data.meta');
  return declarationConfirmed(authority) && declarationConfirmed(awerb) && declarationConfirmed(ready);
};
