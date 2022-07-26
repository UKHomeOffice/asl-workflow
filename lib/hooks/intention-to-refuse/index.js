const { get } = require('lodash');

module.exports = settings => {
  return task => {
    const type = get(task, 'data.model');
    const profile = get(task, 'meta.user.profile');
    const isAsruInspector = profile.asruUser && profile.asruInspector;
    const intentionToRefuse = get(task, 'meta.payload.meta.refusalNotice');

    if (type === 'project' && isAsruInspector && intentionToRefuse) {
      return task.patch({ intentionToRefuse });
    }

    return Promise.resolve();
  };
};
