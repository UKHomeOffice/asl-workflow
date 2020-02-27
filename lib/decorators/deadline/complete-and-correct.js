// declarations can be 'Yes', 'No', or 'Not yet'
const declarationConfirmed = declaration => declaration && declaration.toLowerCase() === 'yes';

module.exports = meta => {
  const { authority, awerb, ready } = meta || {};
  return declarationConfirmed(authority) && declarationConfirmed(awerb) && declarationConfirmed(ready);
};
