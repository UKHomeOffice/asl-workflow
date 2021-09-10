const { get, pick, size, isUndefined } = require('lodash');

module.exports = (settings, model) => {
  const declarations = [
    'authority',
    'ready',
    'authority-pelholder-name',
    'authority-endorsement-date',
    'awerb', // legacy awerb required
    'awerb-review-date', // legacy freetext
    'awerb-exempt',
    'awerb-dates',
    'awerb-no-review-reason',
    'deadline-passed-reason',
    'declaration',
    'ra-awerb-date'
  ];
  const meta = get(model, 'meta.payload.meta', {});
  const updates = pick(meta, declarations);

  if (updates['awerb-dates'] && updates['awerb-dates'].length > 0) {
    updates.awerb = true; // set legacy awerb flag
  }

  if (!isUndefined(updates['awerb-exempt'])) {
    // toggle legacy awerb flag for BC
    updates.awerb = updates['awerb-exempt'] === false;
  }

  const version = get(model, 'meta.payload.meta.version', null);
  const raVersion = get(model, 'meta.payload.meta.raVersion', null);
  const data = get(model, 'data');

  if (size(updates)) {
    Object.assign(data.meta, updates);
  }
  if (version) {
    Object.assign(data.data, { version });
  }
  if (raVersion) {
    Object.assign(data.data, { raVersion });
  }

  return model.update(data);
};
