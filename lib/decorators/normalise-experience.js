const { get, pick } = require('lodash');

const experienceFields = [
  'experience-projects',
  'experience-animals',
  'experience-achievements',
  'experience-experimental-design',
  'experience-others',
  'funding-previous'
];

// older change of licence holder tasks had the experience answers stored in the task metadata
module.exports = settings => task => {
  const isUpdate = get(task, 'data.action') === 'update';
  const isChangeOfLicenceHolder = get(task, 'data.data.licenceHolderId') !== get(task, 'data.modelData.licenceHolderId');

  if (isUpdate && isChangeOfLicenceHolder) {
    const taskMeta = get(task, 'data.meta', {});
    const experienceAnswers = pick(taskMeta, experienceFields);

    return {
      ...task,
      data: {
        ...task.data,
        data: {
          ...experienceAnswers,
          ...task.data.data
        }
      }
    };
  }

  return task;
};
