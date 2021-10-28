const { get, pick, merge } = require('lodash');

const experienceFields = [
  'experience-projects',
  'experience-animals',
  'experience-achievements',
  'experience-experimental-design',
  'experience-knowledge',
  'experience-others',
  'funding-previous',
  'training-has-delivered',
  'training-delivery-experience',
  'training-knowledge',
  'training-facilities'
];

// older change of licence holder tasks had the experience answers stored in the task metadata
module.exports = settings => task => {
  const isUpdate = get(task, 'data.action') === 'update';
  const isChangeOfLicenceHolder = get(task, 'data.data.licenceHolderId') !== get(task, 'data.modelData.licenceHolderId');

  if (isUpdate && isChangeOfLicenceHolder) {
    const taskMeta = get(task, 'data.meta', {});
    const experienceAnswers = pick(taskMeta, experienceFields);
    const movedAnswers = { data: { data: { ...experienceAnswers } } };

    return merge({}, movedAnswers, task);
  }

  return task;
};
