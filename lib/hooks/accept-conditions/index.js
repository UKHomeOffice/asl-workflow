const { get } = require('lodash');

module.exports = settings => {
  return async model => {
    const type = get(model, 'data.model');
    const action = get(model, 'data.action');

    console.log(type);
    console.log(action);
    // if (type === 'project' && action === 'manage-conditions') {
    //   console.log('grant amendment');
    //   const modelData = get(model, 'data.modelData');
    //   const proj = await settings.models.Project.query().findById(id).select('licenceNumber');
    //   const patch = {
    //     ...modelData,
    //     licenceNumber: proj.licenceNumber
    //   };
    //   await model.patch({modelData: patch});
    // }
  };
};
