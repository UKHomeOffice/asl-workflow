function isTruthy(val) {
  const yeps = [
    'Yes',
    'yes',
    true,
    1
  ];
  return yeps.includes(val);
}

module.exports = meta => {
  const { authority, awerb, ready } = meta || {};
  return [authority, awerb, ready].every(isTruthy);
};
