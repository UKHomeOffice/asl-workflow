const { ref } = require('objection');
const { get, isUndefined } = require('lodash');

module.exports = settings => {
  const { ProjectVersion } = settings.models;

  return c => {
    const model = get(c, 'data.model');
    const action = get(c, 'data.action');

    if (model === 'project' && (action === 'grant' || action === 'transfer')) {
      const continuation = get(c, 'data.continuation');
      // continuation added on init, noop.
      if (!isUndefined(continuation)) {
        return c;
      }

      const versionId = get(c, 'data.data.version');
      if (!versionId) {
        return c;
      }

      return ProjectVersion
        .queryWithDeleted()
        .findById(versionId)
        .select(
          ref('data:transfer-expiring')
            .castBool()
            .as('expiring'),
          ref('data:project-continuation')
            .castJson()
            .as('continuation')
        )
        .then(version => {
          if (!version) {
            return c;
          }
          const { continuation, expiring } = version;
          if (!expiring) {
            return c;
          }
          return {
            ...c,
            data: {
              ...c.data,
              continuation
            }
          };
        });
    }

    return c;

  };
};
