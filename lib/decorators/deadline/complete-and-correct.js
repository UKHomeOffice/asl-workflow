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
  const { authority, awerb } = meta || {};
  return [authority, awerb].every(isTruthy);
};
