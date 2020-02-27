const { get } = require('lodash');

module.exports = (Case, settings) => {
  return since => {
    return Promise.resolve()
      .then(() => {
        return Case.query()
          .eager('[activityLog]')
          .modifyEager('[activityLog]', builder => {
            builder.select('eventName').where('eventName', 'ilike', 'status:%:returned-to-applicant');
          })
          .where('updated_at', '>', since)
          .where({ status: 'resolved' });
      })
      // exclude ASRU TEST
      .then(cases => {
        return cases.filter(c => c.data.establishmentId !== 1502162);
      })
      .then(cases => {
        return cases.map(c => {
          let type = `${c.data.model}-${c.data.action}`;
          let schemaVersion;
          if (['pil', 'project'].includes(c.data.model) && c.data.action === 'grant') {
            const isAmendment = get(c, 'data.modelData.status') === 'active';
            type = `${c.data.model}-${isAmendment ? 'amendment' : 'application'}`;
          }
          if (c.data.model === 'project') {
            schemaVersion = get(c, 'data.modelData.schemaVersion');
          }
          const iterations = c.activityLog.length + 1;
          return { type, iterations, schemaVersion };
        });
      });
  };
};
